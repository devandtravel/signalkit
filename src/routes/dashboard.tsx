import { useConvexAction } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { type Repo, RepoPicker } from "../components/RepoPicker";
import { TimeframeSelector } from "../components/TimeframeSelector";

import { getMockSignals } from "../lib/demo-data";

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
  const [churnFiles, setChurnFiles] = useState<Array<{ file: string; prCount: number }>>([]);
  const computeTimeSink = useConvexAction(api.sensors.computeTimeSink);

  // Demo Mode
  const [isDemo, setIsDemo] = useState(false);

  const refreshSignals = useCallback(async () => {
    if (!selectedRepo) return;
    
    if (isDemo) {
        const mockData = getMockSignals(selectedRepo.id, timeframe);
        setTimeSinkScore(mockData.score);
        setChurnFiles(mockData.churnFiles);
        return;
    }

    try {
      const result = await computeTimeSink({
        githubRepoId: selectedRepo.id,
        timeframeDays: timeframe,
      });
      setTimeSinkScore(result.score);
      setChurnFiles(result.churnFiles);
    } catch (err) {
      console.error("Signal calc failed:", err);
    }
  }, [selectedRepo, timeframe, computeTimeSink, isDemo]);

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
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/50">
                  <div className="text-sm text-gray-400">Select a repository to view signals</div>
                </div>
              ) : (
                // Time Sink Signal
                <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-8 transition-all hover:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-mono text-lg font-medium text-gray-200">Time Sink</h3>
                      <p className="mt-1 text-sm text-gray-500">Rework detected in merged PRs</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-bold ${
                          timeSinkScore !== null && timeSinkScore > 20 ? "text-red-400" : "text-white"
                        }`}
                      >
                        {timeSinkScore !== null ? timeSinkScore : "--"}
                      </span>
                      <span className="text-sm text-gray-500">%</span>
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
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
