import { useState } from "react";

interface InfoTooltipProps {
  content: string;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}

export function InfoTooltip({ content, children, align = "center" }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const alignStyles = {
    left: "left-0 translate-x-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0 translate-x-0"
  };

  const arrowStyles = {
    left: "left-4",
    center: "left-1/2 -ml-1",
    right: "right-4"
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute bottom-full mb-2 w-64 rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-300 shadow-xl z-50 pointer-events-none ${alignStyles[align]}`}>
          {content}
          <div className={`absolute top-full border-4 border-solid border-transparent border-t-gray-700 ${arrowStyles[align]}`}></div>
        </div>
      )}
    </div>
  );
}
