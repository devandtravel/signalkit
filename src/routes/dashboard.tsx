import { useConvexAction } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import { CodebaseAgeCard } from "../components/dashboard/CodebaseAgeCard";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { PulseCard } from "../components/dashboard/PulseCard";
import { TimeSinkCard } from "../components/dashboard/TimeSinkCard";
import { TruckFactorCard } from "../components/dashboard/TruckFactorCard";
import { InfoTooltip } from "../components/InfoTooltip";
import { InfoIcon } from "../components/icons";
import { type Repo, RepoPicker } from "../components/RepoPicker";
import { TimeframeSelector } from "../components/TimeframeSelector";
import type { CodebaseAge } from "../lib/mocks/codebase-age";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

export function Dashboard() {
  const { t } = useTranslation();
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
  const [heroes, setHeroes] = useState<
    Array<{ author: string; fileCount: number; topFiles: string[] }>
  >([]);
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
    const showRed = !isGood; // showRed is true if the trend is "bad" (e.g., score increased for inverse, or decreased for non-inverse)

    return (
      <InfoTooltip content={`${t("common.compared_to_previous", { count: timeframe })}`}>
        <div
          className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            showRed ? "text-red-400 bg-red-400/10" : "text-green-400 bg-green-400/10"
          }`}
        >
          {showRed ? "↑" : "↓"}
          {Math.abs(diff)}%
        </div>
      </InfoTooltip>
    );
  };

  const refreshSignals = useCallback(async () => {
    if (!selectedRepo) return;

    if (isDemo) {
      // Fetch Mock Data
      import("../lib/demo-data").then(
        ({ getMockSignals, getMockTruckFactor, getMockPulse, getMockCodebaseAge }) => {
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
        },
      );
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
        accessToken: accessToken ?? undefined,
        repoName: selectedRepo.fullName,
      });
      setCodebaseAge(ageResult as CodebaseAge);
    } catch (err) {
      console.error("Signal calc failed:", err);
    }
  }, [
    selectedRepo,
    timeframe,
    computeTimeSink,
    computeTruckFactor,
    computePulse,
    isDemo,
    computeCodebaseAge,
    accessToken,
  ]);

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
  const handleSync = useCallback(async () => {
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
        limit: 100,
      });
      await refreshSignals();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }, [selectedRepo, accessToken, isDemo, syncRepo, refreshSignals]);

  // Initial load or on selection change - Auto Sync
  useEffect(() => {
    if (selectedRepo) {
      // First, get whatever data we have locally
      refreshSignals();
      
      // Then, trigger a sync to get fresh data
      // We use a small timeout to let the UI settle and not block rendering
      const timer = setTimeout(() => {
         handleSync();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedRepo, refreshSignals, handleSync]);

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
        syncing={syncing}
        onSync={handleSync}
      />

      <main className="mx-auto max-w-6xl space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Controls */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t("dashboard.data_source.title")}
              </h2>
              {isDemo || accessToken ? (
                <RepoPicker accessToken={accessToken} onSelect={setSelectedRepo} isDemo={isDemo} />
              ) : null}
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t("dashboard.timeframe.title")}
              </h2>
              <TimeframeSelector days={timeframe} onChange={setTimeframe} />
            </section>
          </div>

          {/* Right Column: Signals */}
          <div className="lg:col-span-2 space-y-6">
            <section className="mb-12">
              <h2 className="mb-6 border-b border-gray-800 pb-2 font-mono text-sm font-bold uppercase tracking-widest text-gray-500">
                {t("dashboard.signals.title")}
              </h2>
              {!selectedRepo ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-800 bg-gray-950 px-8 py-20 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-gray-700">
                    <InfoIcon size={32} title="Info" />
                  </div>
                  <h2 className="mb-2 text-xl font-medium text-gray-300">
                    {t("dashboard.empty_state.no_repo")}
                  </h2>
                  <p className="max-w-md text-gray-500 leading-relaxed font-light">
                    {t("dashboard.empty_state.no_repo_desc")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <CodebaseAgeCard data={codebaseAge} />

                  <TimeSinkCard
                    score={timeSinkScore}
                    prevScore={prevTimeSinkScore}
                    churnFiles={churnFiles}
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
