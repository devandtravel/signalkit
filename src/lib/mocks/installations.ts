import type { Repo } from "../../components/RepoPicker";

export const MOCK_INSTALLATIONS = [
  {
    id: 9001,
    account: { login: "demo-engineer", avatarUrl: "https://ui-avatars.com/api/?name=Demo+Engineer&background=0D8ABC&color=fff", type: "User" },
  },
  {
    id: 9002,
    account: { login: "startup-inc", avatarUrl: "https://ui-avatars.com/api/?name=Startup+Inc&background=random", type: "Organization" },
  },
  {
    id: 9003,
    account: { login: "enterprise-corp", avatarUrl: "https://ui-avatars.com/api/?name=Enterprise+Corp&background=333&color=fff", type: "Organization" },
  },
  {
    id: 9004,
    account: { login: "acme-solutions", avatarUrl: "https://ui-avatars.com/api/?name=Acme+Solutions&background=666&color=fff", type: "Organization" },
  },
  {
    id: 9005,
    account: { login: "hobby-collective", avatarUrl: "https://ui-avatars.com/api/?name=Hobby+Collective&background=f0f&color=fff", type: "Organization" },
  },
];

export const MOCK_REPOS: Record<number, Repo[]> = {
  9001: [
    { id: 101, name: "personal-portfolio", fullName: "demo-engineer/personal-portfolio", private: false, defaultBranch: "main" },
    { id: 102, name: "obsidian-plugin", fullName: "demo-engineer/obsidian-plugin", private: false, defaultBranch: "master" },
    { id: 103, name: "dotfiles", fullName: "demo-engineer/dotfiles", private: false, defaultBranch: "main" },
    { id: 104, name: "marketing-site", fullName: "cool-startup/marketing-site", private: true, defaultBranch: "production" },
    { id: 105, name: "backend-api", fullName: "cool-startup/backend-api", private: true, defaultBranch: "main" },
    { id: 106, name: "react-components", fullName: "open-source-co/react-components", private: false, defaultBranch: "main" },
  ],
  9002: [
    { id: 201, name: "core-platform", fullName: "startup-inc/core-platform", private: true, defaultBranch: "main" },
    { id: 202, name: "mobile-app", fullName: "startup-inc/mobile-app", private: true, defaultBranch: "develop" },
    { id: 203, name: "analytics-service", fullName: "startup-inc/analytics-service", private: true, defaultBranch: "main" },
    { id: 204, name: "auth-gateway", fullName: "startup-inc/auth-gateway", private: true, defaultBranch: "main" },
  ],
  9003: [
    { id: 301, name: "legacy-billing", fullName: "enterprise-corp/legacy-billing", private: true, defaultBranch: "trunk" },
    { id: 302, name: "frontend-monorepo", fullName: "enterprise-corp/frontend-monorepo", private: true, defaultBranch: "main" },
    { id: 303, name: "data-warehouse", fullName: "enterprise-corp/data-warehouse", private: true, defaultBranch: "main" },
    { id: 304, name: "internal-tools", fullName: "enterprise-corp/internal-tools", private: true, defaultBranch: "master" },
  ],
  9004: [
    { id: 401, name: "widget-factory", fullName: "acme-solutions/widget-factory", private: false, defaultBranch: "main" },
    { id: 402, name: "compliance-checker", fullName: "acme-solutions/compliance-checker", private: true, defaultBranch: "main" },
    { id: 403, name: "inventory-sync", fullName: "acme-solutions/inventory-sync", private: true, defaultBranch: "main" },
  ],
  9005: [
    { id: 501, name: "recipe-manager", fullName: "hobby-collective/recipe-manager", private: false, defaultBranch: "main" },
    { id: 502, name: "fitness-tracker", fullName: "hobby-collective/fitness-tracker", private: false, defaultBranch: "main" },
    { id: 503, name: "dnd-character-sheet", fullName: "hobby-collective/dnd-character-sheet", private: false, defaultBranch: "main" },
  ],
};

export const getMockInstallations = () => MOCK_INSTALLATIONS;
export const getMockRepos = (installationId: number) => MOCK_REPOS[installationId] || [];
