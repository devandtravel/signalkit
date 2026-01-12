import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../InfoTooltip";
import { InfoIcon, RefreshIcon } from "../icons";

interface TimeSinkCardProps {
  score: number | null;
  prevScore: number | null;
  churnFiles: Array<{ file: string; prCount: number }>;
  syncing: boolean;
  onSync: () => void;
  renderTrend: (
    current: number | null,
    previous: number | null,
    inverse?: boolean,
  ) => React.ReactNode;
}

export function TimeSinkCard({
  score,
  prevScore,
  churnFiles,
  syncing,
  onSync,
  renderTrend,
}: TimeSinkCardProps) {
  const { t } = useTranslation();
  return (
    <div className="relative rounded-2xl border border-gray-800 bg-gray-900 p-8 transition-all hover:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-lg font-medium text-gray-200">
              {t("dashboard.signals.time_sink.title")}
            </h3>
            <InfoTooltip align="left" content={t("dashboard.signals.time_sink.tooltip")}>
              <span className="cursor-help text-gray-600 hover:text-gray-400">
                <InfoIcon className="h-4 w-4" title="Sensor Details" />
              </span>
            </InfoTooltip>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t("dashboard.signals.time_sink.description")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-bold ${
                score !== null && score > 20 ? "text-red-400" : "text-white"
              }`}
            >
              {score !== null ? score : "--"}
            </span>
            <span className="text-sm text-gray-500">%</span>
          </div>
          {renderTrend(score, prevScore, true)}
        </div>
      </div>

      <div className="mt-8 h-2 w-full rounded-full bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            score !== null && score > 20
              ? "bg-red-500"
              : "bg-gradient-to-r from-blue-500 to-purple-500"
          }`}
          style={{ width: `${score || 0}%` }}
        ></div>
      </div>

      {churnFiles.length > 0 && (
        <div className="mt-8 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("dashboard.signals.time_sink.high_churn_files")}
          </h4>
          <div className="space-y-2">
            {churnFiles.map((file) => (
              <div
                key={file.file}
                className="flex items-center justify-between rounded bg-gray-800/50 px-3 py-2 text-xs"
              >
                <span className="font-mono text-gray-300 truncate max-w-[300px]" title={file.file}>
                  {file.file}
                </span>
                <span className="text-gray-500">
                  {file.prCount} {t("dashboard.signals.time_sink.prs")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <RefreshIcon className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? t("common.ingesting") : t("common.refresh_ingest")}
        </button>
      </div>
    </div>
  );
}
