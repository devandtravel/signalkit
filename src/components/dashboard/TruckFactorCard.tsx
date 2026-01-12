import { InfoTooltip } from "../InfoTooltip";

interface TruckFactorCardProps {
  score: number | null;
  prevScore: number | null;
  heroes: Array<{ author: string; fileCount: number; topFiles: string[] }>;
  renderTrend: (current: number | null, previous: number | null, inverse?: boolean) => React.ReactNode;
}

export function TruckFactorCard({ score, prevScore, heroes, renderTrend }: TruckFactorCardProps) {
  return (
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
                  score !== null && score > 50 ? "text-orange-400" : "text-green-400"
                }`}
              >
                {score !== null ? score : "--"}
              </span>
              <span className="text-[10px] uppercase text-gray-500 tracking-wider">Risk Score</span>
            </div>
            {renderTrend(score, prevScore, true)}
        </div>
      </div>

       <div className="mt-8 h-2 w-full rounded-full bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            score !== null && score > 50
              ? "bg-orange-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${score || 0}%` }}
        ></div>
      </div>

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
          score === 0 && (
              <div className="mt-8 text-sm text-gray-500 italic">
                  No silos detected. Knowledge appears well distributed.
              </div>
          )
      )}
    </div>
  );
}
