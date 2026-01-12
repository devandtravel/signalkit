import { useConvexAction } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { type Repo, RepoPicker } from "../components/RepoPicker";
import { TimeframeSelector } from "../components/TimeframeSelector";
import { InfoTooltip } from "../components/InfoTooltip";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authType, setAuthType] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [timeframe, setTimeframe] = useState(14);

  useEffect(() => {
    // Client-side only: retrieve persisted token and auth type
    const token = localStorage.getItem("github_access_token");
    const storedAuthType = localStorage.getItem("auth_type");
    setAccessToken(token);
    setAuthType(storedAuthType);
  }, []);

  /* Time Sink State */
  const [timeSinkScore, setTimeSinkScore] = useState<number | null>(null);
  const [prevTimeSinkScore, setPrevTimeSinkScore] = useState<number | null>(null); // New
  const [churnFiles, setChurnFiles] = useState<Array<{ file: string; prCount: number }>>([]);
  const computeTimeSink = useConvexAction(api.sensors.timeSink.compute);

  /* Truck Factor State */
  const [truckFactorScore, setTruckFactorScore] = useState<number | null>(null);
  const [prevTruckFactorScore, setPrevTruckFactorScore] = useState<number | null>(null); // New
  const [heroes, setHeroes] = useState<Array<{ author: string; fileCount: number; topFiles: string[] }>>([]);
  const computeTruckFactor = useConvexAction(api.sensors.truckFactor.compute);

  /* Pulse State */
  const [pulseScore, setPulseScore] = useState<number | null>(null);
  const [prevPulseScore, setPrevPulseScore] = useState<number | null>(null); // New
  const [pulseStatus, setPulseStatus] = useState<string | null>(null);
  const [dailyActivity, setDailyActivity] = useState<Array<{ date: string; count: number }>>([]);
  const computePulse = useConvexAction(api.sensors.pulse.compute);

  // Demo Mode
  const [isDemo, setIsDemo] = useState(false);

  // Helper to render trend
  const renderTrend = (current: number | null, previous: number | null, inverse = false) => {
      if (current === null || previous === null) return null;
      const diff = current - previous;
      if (diff === 0) return <span className="text-gray-500 text-xs">—</span>;
      
      const isGood = inverse ? diff < 0 : diff > 0;
      const color = isGood ? "text-emerald-400" : "text-rose-400";
      const icon = diff > 0 ? "↑" : "↓";
      
      return (
          <InfoTooltip content={`Compared to the previous ${timeframe} days`} align="right">
              <span className={`text-xs font-mono font-medium ${color} flex items-center gap-1 bg-gray-900/50 px-1.5 py-0.5 rounded border border-gray-800 cursor-help`}>
                 {icon} {Math.abs(diff)}
              </span>
          </InfoTooltip>
      );
  };

  const refreshSignals = useCallback(async () => {
    if (!selectedRepo) return;
    
    if (isDemo) {
        // Fetch Mock Data
        import("../lib/demo-data").then(({ getMockSignals, getMockTruckFactor, getMockPulse }) => {
             const signals = getMockSignals(selectedRepo.id, timeframe);
             const tf = getMockTruckFactor(selectedRepo.id, timeframe);
             const pulse = getMockPulse(selectedRepo.id, timeframe);
             
             setTimeSinkScore(signals.score);
             setPrevTimeSinkScore(signals.previousScore);
             setChurnFiles(signals.churnFiles);
             
             setTruckFactorScore(tf.riskScore);
             setPrevTruckFactorScore(tf.previousRiskScore);
             setHeroes(tf.heroes);

             setPulseScore(pulse.score);
             setPrevPulseScore(pulse.previousScore);
             setPulseStatus(pulse.status);
             setDailyActivity(pulse.dailyActivity);
        });
        return;
    }

    try {
      // 1. Time Sink
      const result = await computeTimeSink({
        githubRepoId: selectedRepo.id,
        timeframeDays: timeframe,
      });
      setTimeSinkScore(result.score);
      setPrevTimeSinkScore(result.previousScore);
      setChurnFiles(result.churnFiles);

      // 2. Truck Factor
      const tfResult = await computeTruckFactor({
          githubRepoId: selectedRepo.id,
          timeframeDays: timeframe,
      });
      setTruckFactorScore(tfResult.riskScore);
      setPrevTruckFactorScore(tfResult.previousRiskScore);
      setHeroes(tfResult.heroes);

      // 3. Pulse
      const pulseResult = await computePulse({
          githubRepoId: selectedRepo.id,
          timeframeDays: timeframe,
      });
      setPulseScore(pulseResult.score);
      setPrevPulseScore(pulseResult.previousScore);
      setPulseStatus(pulseResult.status);
      setDailyActivity(pulseResult.dailyActivity);

    } catch (err) {
      console.error("Signal calc failed:", err);
    }
  }, [selectedRepo, timeframe, computeTimeSink, computeTruckFactor, computePulse, isDemo]);

  // Initial load or on selection change
  useEffect(() => {
    if (selectedRepo) {
      refreshSignals();
    }
  }, [selectedRepo, refreshSignals]);

  // Set initial state for Demo Mode if needed (optional, or let user select from RepoPicker)
  useEffect(() => {
     if (localStorage.getItem("is_demo_mode") === "true") {
        setIsDemo(true);
        // We don't pre-select a repo anymore, let the user choose from the visible picker
     }
  }, []);

  const [syncing, setSyncing] = useState(false);
  const syncRepo = useConvexAction(api.github.syncRepo);

  // Hook into sync to refresh signals
  const handleSync = async () => {
    if (isDemo) {
        setSyncing(true);
        setTimeout(() => setSyncing(false), 1000); // Fake sync
        return;
    }
    if (!selectedRepo || !accessToken) return;
    setSyncing(true);
    try {
      await syncRepo({
        accessToken,
        repoId: selectedRepo.id,
        repoName: selectedRepo.fullName,
        repoFullName: selectedRepo.fullName,
        repoPrivate: selectedRepo.private,
        limit: 20,
      });
      await refreshSignals();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <header className="mb-12 flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          SIGNALKIT
        </h1>
        <div className="flex items-center gap-4">
          {authType && (
             <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                 authType === 'app' 
                    ? "border-purple-500/30 bg-purple-500/10 text-purple-400" 
                    : "border-blue-500/30 bg-blue-500/10 text-blue-400"
             }`}>
                {authType === 'app' ? "GitHub App" : "Standard OAuth"}
             </div>
          )}
          {selectedRepo && (
            <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-mono text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
              {selectedRepo.fullName}
            </div>
          )}
          <button
            onClick={() => {
              localStorage.removeItem("github_access_token");
              localStorage.removeItem("github_user_id");
              localStorage.removeItem("auth_type");
              localStorage.removeItem("is_demo_mode");
              window.location.href = "/";
            }}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            {isDemo ? "Exit Demo" : "Sign Out"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Controls */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Data Source
              </h2>
              {isDemo || accessToken ? (
                  <RepoPicker 
                    accessToken={accessToken} 
                    onSelect={setSelectedRepo} 
                    isDemo={isDemo} 
                  />
              ) : null}
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Timeframe
              </h2>
              <TimeframeSelector days={timeframe} onChange={setTimeframe} />
            </section>
          </div>

          {/* Right Column: Signals */}
          <div className="lg:col-span-2 space-y-6">
            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Signals
              </h2>
              {!selectedRepo ? (
                <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/50 p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50 text-2xl">
                    📊
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-200">No Repository Selected</h3>
                  <p className="max-w-sm text-sm text-gray-500 leading-relaxed">
                    Select a repository from your connected installations to start monitoring development signals, churn, and team distribution.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                {/* Time Sink Signal */}
                <div className="relative rounded-2xl border border-gray-800 bg-gray-900 p-8 transition-all hover:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-medium text-gray-200">Time Sink</h3>
                        <InfoTooltip align="left" content="Measures engineering rework by tracking how often files are modified shortly after being merged. High churn suggests technical debt or changing requirements.">
                            <span className="cursor-help text-gray-600 hover:text-gray-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </InfoTooltip>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Rework detected in merged PRs</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-baseline gap-2">
                        <span
                            className={`text-4xl font-bold ${
                            timeSinkScore !== null && timeSinkScore > 20 ? "text-red-400" : "text-white"
                            }`}
                        >
                            {timeSinkScore !== null ? timeSinkScore : "--"}
                        </span>
                        <span className="text-sm text-gray-500">%</span>
                        </div>
                        {renderTrend(timeSinkScore, prevTimeSinkScore, true)}
                    </div>
                  </div>

                  <div className="mt-8 h-2 w-full rounded-full bg-gray-800">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        timeSinkScore !== null && timeSinkScore > 20
                          ? "bg-red-500"
                          : "bg-gradient-to-r from-blue-500 to-purple-500"
                      }`}
                      style={{ width: `${timeSinkScore || 0}%` }}
                    ></div>
                  </div>

                  {/* Churn Files List */}
                  {churnFiles.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        High Churn Files
                      </h4>
                      <div className="space-y-2">
                        {churnFiles.map((file) => (
                          <div
                            key={file.file}
                            className="flex items-center justify-between rounded bg-gray-800/50 px-3 py-2 text-xs"
                          >
                            <span
                              className="font-mono text-gray-300 truncate max-w-[300px]"
                              title={file.file}
                            >
                              {file.file}
                            </span>
                            <span className="text-gray-500">{file.prCount} PRs</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSync}
                      disabled={syncing}
                      className="rounded-md bg-gray-800 px-4 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      {syncing ? "Ingesting..." : "Refresh / Ingest Data"}
                    </button>
                  </div>
                </div>

                {/* Truck Factor Signal */}
                <div className="relative rounded-2xl border border-gray-800 bg-gray-900 p-8 transition-all hover:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-medium text-gray-200">Truck Factor</h3>
                        <InfoTooltip align="left" content="Also known as the Bus Factor. It calculates how many key developers would need to be 'hit by a truck' before the project stalls due to knowledge silos.">
                            <span className="cursor-help text-gray-600 hover:text-gray-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </InfoTooltip>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Knowledge Silos & Hero Developers</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                          <div className="flex items-baseline gap-2">
                          <span
                            className={`text-4xl font-bold ${
                              truckFactorScore !== null && truckFactorScore > 50 ? "text-orange-400" : "text-green-400"
                            }`}
                          >
                            {truckFactorScore !== null ? truckFactorScore : "--"}
                          </span>
                          <span className="text-[10px] uppercase text-gray-500 tracking-wider">Risk Score</span>
                        </div>
                        {renderTrend(truckFactorScore, prevTruckFactorScore, true)}
                    </div>
                  </div>

                   <div className="mt-8 h-2 w-full rounded-full bg-gray-800">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        truckFactorScore !== null && truckFactorScore > 50
                          ? "bg-orange-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${truckFactorScore || 0}%` }}
                    ></div>
                  </div>

                  {/* Heroes List */}
                  {heroes.length > 0 ? (
                    <div className="mt-8 space-y-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Primary Maintainers
                      </h4>
                      <div className="space-y-3">
                        {heroes.map((hero) => (
                          <div key={hero.author} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                      <span className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                          {hero.author.slice(0, 2).toUpperCase()}
                                      </span>
                                      <span className="text-gray-300 font-medium">{hero.author}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">{hero.fileCount} critical files</span>
                              </div>
                              <div className="pl-8 space-y-1">
                                  {hero.topFiles.map(file => (
                                      <div key={file} className="text-[10px] font-mono text-gray-500 truncate">
                                          {file}
                                      </div>
                                  ))}
                              </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                      truckFactorScore === 0 && (
                          <div className="mt-8 text-sm text-gray-500 italic">
                              No silos detected. Knowledge appears well distributed.
                          </div>
                      )
                  )}
                </div>

                {/* Pulse Signal */}
                <div className="relative rounded-2xl border border-gray-800 bg-gray-900 p-8 transition-all hover:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-medium text-gray-200">Pulse</h3>
                        <InfoTooltip align="left" content="Development cadence and velocity. High cadence indicates frequent shipping and momentum. Sporadic activity might suggest project instability.">
                            <span className="cursor-help text-gray-600 hover:text-gray-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </InfoTooltip>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Development Cadence</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-baseline gap-2">
                            <span
                                className={`text-2xl font-bold font-mono ${
                                    pulseStatus === 'High Cadence' ? "text-purple-400" :
                                    pulseStatus === 'Consistent' ? "text-blue-400" :
                                    pulseStatus === 'Sporadic' ? "text-yellow-400" :
                                    "text-gray-500"
                                }`}
                            >
                                {pulseStatus || "--"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderTrend(pulseScore, prevPulseScore, false)}
                            <span className="text-[10px] uppercase text-gray-500 tracking-wider">Score: {pulseScore}</span>
                        </div>
                    </div>
                  </div>

                  {/* Heatmap Visualization */}
                  {dailyActivity.length > 0 && (
                      <div className="mt-8">
                          <div className="flex items-end gap-[2px] h-16 w-full">
                              {dailyActivity.map((day) => {
                                  // Normalize height based on max (or simple cap)
                                  const height = day.count > 0 ? Math.min(100, Math.max(10, day.count * 10)) : 5;
                                  // Color intensity
                                  const opacity = day.count > 0 ? Math.min(1, 0.3 + (day.count / 10)) : 0.1;
                                  
                                  return (
                                      <div 
                                          key={day.date} 
                                          className="flex-1 bg-purple-500 rounded-sm hover:opacity-100 transition-all relative group"
                                          style={{ 
                                              height: `${height}%`, 
                                              opacity: opacity
                                          }}
                                      >
                                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10 border border-gray-700">
                                              {day.date}: {day.count} events
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                          <div className="mt-2 text-[10px] text-gray-500 flex justify-between uppercase tracking-wider font-mono">
                                <span>{dailyActivity[0]?.date}</span>
                                <span>{dailyActivity[dailyActivity.length - 1]?.date}</span>
                          </div>
                      </div>
                  )}
                </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
