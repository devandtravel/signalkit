import { InfoTooltip } from "../InfoTooltip";

interface PulseCardProps {
  score: number | null;
  prevScore: number | null;
  status: string | null;
  dailyActivity: Array<{ date: string; count: number }>;
  renderTrend: (current: number | null, previous: number | null, inverse?: boolean) => React.ReactNode;
}

export function PulseCard({ score, prevScore, status, dailyActivity, renderTrend }: PulseCardProps) {
  return (
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
                        status === 'High Cadence' ? "text-purple-400" :
                        status === 'Consistent' ? "text-blue-400" :
                        status === 'Sporadic' ? "text-yellow-400" :
                        "text-gray-500"
                    }`}
                >
                    {status || "--"}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {renderTrend(score, prevScore, false)}
                <span className="text-[10px] uppercase text-gray-500 tracking-wider">Score: {score}</span>
            </div>
        </div>
      </div>

      {dailyActivity.length > 0 && (
          <div className="mt-8">
              <div className="flex items-end gap-[2px] h-16 w-full">
                  {dailyActivity.map((day) => {
                      const height = day.count > 0 ? Math.min(100, Math.max(10, day.count * 10)) : 5;
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
  );
}
