import { useState } from "react";
import { InfoTooltip } from "../InfoTooltip";
import { type CodebaseAge } from "../../lib/mocks/codebase-age";

interface CodebaseAgeCardProps {
  data: CodebaseAge | null;
}

export function CodebaseAgeCard({ data }: CodebaseAgeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  return (
    <div className="relative rounded-2xl border border-gray-800 bg-gray-900 p-8 transition-all hover:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-lg font-medium text-gray-200">Codebase Age</h3>
            <InfoTooltip align="left" content="Estimates the 'effective year' of the codebase based on used tools, libraries, and coding styles. Shows how modern or legacy the project feels.">
                <span className="cursor-help text-gray-600 hover:text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
            </InfoTooltip>
          </div>
          <p className="mt-1 text-sm text-gray-500">Effective technology stack era</p>
        </div>
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold font-mono ${
                    data.year >= 2023 ? "text-green-400" :
                    data.year >= 2021 ? "text-blue-400" :
                    "text-orange-400"
                }`}>
                    {data.year}
                </span>
            </div>
            <span className="text-[10px] uppercase text-gray-500 tracking-wider">
                {data.status}
            </span>
        </div>
      </div>

      <div className="mt-8">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
              <span>{isExpanded ? "Hide Details" : "Why this year?"}</span>
              <svg 
                className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
          </button>

          {isExpanded && (
              <div className="mt-4 space-y-2 border-t border-gray-800 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {data.points.map((point, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                  point.status === 'modern' ? "bg-green-500" : "bg-orange-500"
                              }`}></span>
                              <span className="text-gray-300 font-mono">{point.marker}</span>
                          </div>
                          <span className={`${
                              point.status === 'modern' ? "text-green-500/70" : "text-orange-500/70"
                          }`}>
                              {point.impact}
                          </span>
                      </div>
                  ))}
                  <p className="mt-4 text-[10px] text-gray-500 italic leading-relaxed">
                      * This is an automated assessment of project signatures and may not reflect manual architectural efforts.
                  </p>
              </div>
          )}
      </div>
    </div>
  );
}
