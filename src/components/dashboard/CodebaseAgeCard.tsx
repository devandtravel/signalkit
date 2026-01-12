import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CodebaseAge } from "../../lib/mocks/codebase-age";
import { InfoTooltip } from "../InfoTooltip";
import { ChevronDownIcon, InfoIcon } from "../icons";

interface CodebaseAgeCardProps {
  data: CodebaseAge | null;
}

export function CodebaseAgeCard({ data }: CodebaseAgeCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  return (
    <div className="relative rounded-2xl border border-gray-800 bg-gray-900 p-8 transition-all hover:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-lg font-medium text-gray-200">
              {t("dashboard.signals.codebase_age.title")}
            </h3>
            <InfoTooltip align="left" content={t("dashboard.signals.codebase_age.tooltip")}>
              <span className="cursor-help text-gray-600 hover:text-gray-400">
                <InfoIcon className="h-4 w-4" title="Sensor Details" />
              </span>
            </InfoTooltip>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t("dashboard.signals.codebase_age.description")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-bold font-mono ${
                data.year >= 2023
                  ? "text-green-400"
                  : data.year >= 2021
                    ? "text-blue-400"
                    : "text-orange-400"
              }`}
            >
              {data.year}
            </span>
          </div>
          <span className="text-[10px] uppercase text-gray-500 tracking-wider">
            {data.status
              ? t(
                  `dashboard.signals.codebase_age.status_labels.${data.status.toLowerCase().replace(/[\s/]+/g, "_")}`,
                )
              : ""}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <span>
            {isExpanded
              ? t("dashboard.signals.codebase_age.hide_details")
              : t("dashboard.signals.codebase_age.why_this_year")}
          </span>
          <ChevronDownIcon
            className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            title="Toggle Details"
            aria-hidden="true"
          />
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-2 border-t border-gray-800 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {data.points.map((point) => (
              <div key={point.marker} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      point.status === "modern" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></span>
                  <span className="text-gray-300 font-mono">{point.marker}</span>
                </div>
                <span
                  className={`${
                    point.status === "modern" ? "text-green-500/70" : "text-orange-500/70"
                  }`}
                >
                  {point.impact}
                </span>
              </div>
            ))}
            <p className="mt-4 text-[10px] text-gray-500 italic leading-relaxed">
              {t("dashboard.signals.codebase_age.disclaimer")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
