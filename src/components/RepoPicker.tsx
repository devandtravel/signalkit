import { useConvexAction } from "@convex-dev/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";

interface Installation {
  id: number;
  account: {
    login: string;
    avatarUrl: string;
    type: string;
  };
}

export interface Repo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
}

import { MOCK_INSTALLATIONS, MOCK_REPOS } from "../lib/demo-data";

export function RepoPicker({
  accessToken,
  onSelect,
  isDemo = false,
}: {
  accessToken: string | null;
  onSelect: (repo: Repo) => void;
  isDemo?: boolean;
}) {
  const { t } = useTranslation();
  const fetchInstallations = useConvexAction(api.github.fetchInstallations);
  const fetchRepos = useConvexAction(api.github.fetchRepos);

  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedInstallation, setSelectedInstallation] = useState<number | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Installations
  useEffect(() => {
    if (isDemo) {
        setInstallations(MOCK_INSTALLATIONS);
        setSelectedInstallation(MOCK_INSTALLATIONS[0].id);
        return;
    }
    if (!accessToken) return;
    
    setLoading(true);
    fetchInstallations({ accessToken })
      .then((data) => {
        setInstallations(data);
        if (data.length > 0) {
          setSelectedInstallation(data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [accessToken, fetchInstallations, isDemo]);

  // 2. Fetch Repos
  useEffect(() => {
    if (!selectedInstallation) return;

    if (isDemo) {
        setRepos(MOCK_REPOS[selectedInstallation] || []);
        return;
    }
    if (!accessToken) return;

    setLoading(true);
    fetchRepos({ accessToken, installationId: selectedInstallation })
      .then(setRepos)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedInstallation, accessToken, fetchRepos, isDemo]);

  // 3. Owner Filter Logic
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

  // Derive unique owners from the fetched repos
  const owners = Array.from(new Set(repos.map((r) => r.fullName.split("/")[0]))).sort();

  // Reset selected owner when installation changes
  useEffect(() => {
    if (selectedInstallation !== undefined) {
      setSelectedOwner(null);
    }
  }, [selectedInstallation]);

  const filteredRepos = selectedOwner
    ? repos.filter((r) => r.fullName.startsWith(`${selectedOwner}/`))
    : repos;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
      {/* Installations (Scopes) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {installations.map((inst) => (
          <button
            key={inst.id}
            type="button"
            onClick={() => setSelectedInstallation(inst.id)}
            className={`flex flex-shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-all ${
              selectedInstallation === inst.id
                ? "border-green-500/50 bg-green-500/10 text-green-400"
                : "border-transparent bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <img src={inst.account.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
            <span className="max-w-[120px] truncate">{inst.account.login}</span>
          </button>
        ))}
      </div>

      {/* Owner Filter */}
      {owners.length > 1 && (
        <div className="flex flex-wrap gap-2 border-t border-gray-800 pt-3">
          <button
              type="button"
              onClick={() => setSelectedOwner(null)}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                selectedOwner === null
                  ? "bg-white text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {t('common.all')}
            </button>
          {owners.map((owner) => (
            <button
              key={owner}
              type="button"
              onClick={() => setSelectedOwner(owner)}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                selectedOwner === owner
                  ? "bg-white text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {owner}
            </button>
          ))}
        </div>
      )}

      {/* Repo List */}
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {filteredRepos.map((repo) => (
          <button
            key={repo.id}
            type="button"
            onClick={() => onSelect(repo)}
            className="flex items-center justify-between rounded-md border border-gray-800 bg-gray-950/50 px-3 py-2 text-left text-sm text-gray-300 hover:border-gray-700 hover:text-white transition-colors group"
          >
            <div className="flex flex-col truncate">
                <span className="font-mono text-gray-200 group-hover:text-white truncate">{repo.name}</span>
                {!selectedOwner && (
                    <span className="text-[10px] text-gray-600 group-hover:text-gray-500 truncate">
                        {repo.fullName.split('/')[0]}
                    </span>
                )}
            </div>
            <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">→</span>
          </button>
        ))}
        {filteredRepos.length === 0 && !loading && (
          <div className="col-span-2 text-center text-xs text-gray-600 py-4">
            {t('repo_picker.no_repos')}
          </div>
        )}
      </div>
    </div>
  );
}
