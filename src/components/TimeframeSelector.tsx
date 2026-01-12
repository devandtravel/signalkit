interface TimeframeSelectorProps {
  days: number;
  onChange: (days: number) => void;
}

const OPTIONS = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

export function TimeframeSelector({ days, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-900 p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            days === opt.value
              ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
