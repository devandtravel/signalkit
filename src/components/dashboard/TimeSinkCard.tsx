import { InfoTooltip } from "../InfoTooltip";

interface TimeSinkCardProps {
  score: number | null;
  prevScore: number | null;
  churnFiles: Array<{ file: string; prCount: number }>;
  syncing: boolean;
  onSync: () => void;
  renderTrend: (current: number | null, previous: number | null, inverse?: boolean) => React.ReactNode;
}

export function TimeSinkCard({ 
  score, 
  prevScore, 
  churnFiles, 
  syncing, 
  onSync,
  renderTrend
}: TimeSinkCardProps) {
  return (
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
          onClick={onSync}
          disabled={syncing}
          className="rounded-md bg-gray-800 px-4 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {syncing ? "Ingesting..." : "Refresh / Ingest Data"}
        </button>
      </div>
    </div>
  );
}
