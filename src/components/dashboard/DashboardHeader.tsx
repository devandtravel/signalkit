import { type Repo } from "../RepoPicker";

interface DashboardHeaderProps {
  authType: string | null;
  selectedRepo: Repo | null;
  isDemo: boolean;
  onSignOut: () => void;
}

export function DashboardHeader({ authType, selectedRepo, isDemo, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="mb-12 flex items-center justify-between">
      <h1 className="font-mono text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
        SIGNALKIT
      </h1>
      <div className="flex items-center gap-4">
        {authType && (
          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
            authType === 'app' 
              ? "border-purple-500/30 bg-purple-500/10 text-purple-400" 
              : "border-blue-500/30 bg-blue-500/10 text-blue-400"
          }`}>
            {authType === 'app' ? "GitHub App" : "Standard OAuth"}
          </div>
        )}
        {selectedRepo && (
          <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-mono text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            {selectedRepo.fullName}
          </div>
        )}
        <button
          onClick={onSignOut}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          {isDemo ? "Exit Demo" : "Sign Out"}
        </button>
      </div>
    </header>
  );
}
