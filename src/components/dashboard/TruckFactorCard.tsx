import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../InfoTooltip";
import { InfoIcon } from "../icons";

interface TruckFactorCardProps {
  score: number | null;
  prevScore: number | null;
  heroes: Array<{ author: string; fileCount: number; topFiles: string[] }>;
  renderTrend: (
    current: number | null,
    previous: number | null,
    inverse?: boolean,
  ) => React.ReactNode;
}

export function TruckFactorCard({ score, prevScore, heroes, renderTrend }: TruckFactorCardProps) {
  const { t } = useTranslation();
  return (
    <div className="relative rounded-2xl border border-gray-800 bg-gray-900 p-8 transition-all hover:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-lg font-medium text-gray-200">
              {t("dashboard.signals.truck_factor.title")}
            </h3>
            <InfoTooltip align="left" content={t("dashboard.signals.truck_factor.description")}>
              <span className="cursor-help text-gray-600 hover:text-gray-400">
                <InfoIcon className="h-4 w-4" title="Sensor Details" />
              </span>
            </InfoTooltip>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t("dashboard.signals.truck_factor.subtitle")}
          </p>
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
            <span className="text-[10px] uppercase text-gray-500 tracking-wider">
              {t("dashboard.signals.truck_factor.risk_score")}
            </span>
          </div>
          {renderTrend(score, prevScore, true)}
        </div>
      </div>

      <div className="mt-8 h-2 w-full rounded-full bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            score !== null && score > 50 ? "bg-orange-500" : "bg-emerald-500"
          }`}
          style={{ width: `${score || 0}%` }}
        ></div>
      </div>

      {heroes.length > 0 ? (
        <div className="mt-8 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("dashboard.signals.truck_factor.primary_maintainers")}
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
                  <span className="text-xs text-gray-500">
                    {hero.fileCount} {t("dashboard.signals.truck_factor.critical_files")}
                  </span>
                </div>
                <div className="pl-8 space-y-1">
                  {hero.topFiles.map((file) => (
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
            {t("dashboard.signals.truck_factor.no_silos")}
          </div>
        )
      )}
    </div>
  );
}
