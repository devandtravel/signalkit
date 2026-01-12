import { useConvexAction } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { type Repo, RepoPicker } from "../components/RepoPicker";
import { TimeframeSelector } from "../components/TimeframeSelector";
import { InfoTooltip } from "../components/InfoTooltip";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { TimeSinkCard } from "../components/dashboard/TimeSinkCard";
import { TruckFactorCard } from "../components/dashboard/TruckFactorCard";
import { PulseCard } from "../components/dashboard/PulseCard";
import { CodebaseAgeCard } from "../components/dashboard/CodebaseAgeCard";
import { type CodebaseAge } from "../lib/mocks/codebase-age";

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
  const [prevTimeSinkScore, setPrevTimeSinkScore] = useState<number | null>(null);
  const [churnFiles, setChurnFiles] = useState<Array<{ file: string; prCount: number }>>([]);
  const computeTimeSink = useConvexAction(api.sensors.timeSink.compute);

  /* Truck Factor State */
  const [truckFactorScore, setTruckFactorScore] = useState<number | null>(null);
  const [prevTruckFactorScore, setPrevTruckFactorScore] = useState<number | null>(null);
  const [heroes, setHeroes] = useState<Array<{ author: string; fileCount: number; topFiles: string[] }>>([]);
  const computeTruckFactor = useConvexAction(api.sensors.truckFactor.compute);

  /* Pulse State */
  const [pulseScore, setPulseScore] = useState<number | null>(null);
  const [prevPulseScore, setPrevPulseScore] = useState<number | null>(null);
  const [pulseStatus, setPulseStatus] = useState<string | null>(null);
  const [dailyActivity, setDailyActivity] = useState<Array<{ date: string; count: number }>>([]);
  const computePulse = useConvexAction(api.sensors.pulse.compute);

  /* Codebase Age State */
  const [codebaseAge, setCodebaseAge] = useState<CodebaseAge | null>(null);
  const computeCodebaseAge = useConvexAction(api.sensors.codebaseAge.compute);

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
        import("../lib/demo-data").then(({ getMockSignals, getMockTruckFactor, getMockPulse, getMockCodebaseAge }) => {
             const signals = getMockSignals(selectedRepo.id, timeframe);
             const tf = getMockTruckFactor(selectedRepo.id, timeframe);
             const pulse = getMockPulse(selectedRepo.id, timeframe);
             const age = getMockCodebaseAge(selectedRepo.id);
             
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

             setCodebaseAge(age);
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

      // 4. Codebase Age
      const ageResult = await computeCodebaseAge({
          githubRepoId: selectedRepo.id,
          timeframeDays: timeframe,
      });
      setCodebaseAge(ageResult as any);

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

  const handleSignOut = () => {
    localStorage.removeItem("github_access_token");
    localStorage.removeItem("github_user_id");
    localStorage.removeItem("auth_type");
    localStorage.removeItem("is_demo_mode");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <DashboardHeader 
        authType={authType}
        selectedRepo={selectedRepo}
        isDemo={isDemo}
        onSignOut={handleSignOut}
      />

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
                  <CodebaseAgeCard data={codebaseAge} />

                  <TimeSinkCard 
                    score={timeSinkScore}
                    prevScore={prevTimeSinkScore}
                    churnFiles={churnFiles}
                    syncing={syncing}
                    onSync={handleSync}
                    renderTrend={renderTrend}
                  />

                  <TruckFactorCard 
                    score={truckFactorScore}
                    prevScore={prevTruckFactorScore}
                    heroes={heroes}
                    renderTrend={renderTrend}
                  />

                  <PulseCard 
                    score={pulseScore}
                    prevScore={prevPulseScore}
                    status={pulseStatus}
                    dailyActivity={dailyActivity}
                    renderTrend={renderTrend}
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
