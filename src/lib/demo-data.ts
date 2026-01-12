import type { Repo } from "../components/RepoPicker";

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
];

export const MOCK_REPOS: Record<number, Repo[]> = {
  9001: [
    { id: 101, name: "personal-portfolio", fullName: "demo-engineer/personal-portfolio", private: false, defaultBranch: "main" },
    { id: 102, name: "obsidian-plugin", fullName: "demo-engineer/obsidian-plugin", private: false, defaultBranch: "master" },
    { id: 103, name: "dotfiles", fullName: "demo-engineer/dotfiles", private: false, defaultBranch: "main" },
    // Shared / Org Repos (Simulating OAuth access)
    { id: 104, name: "marketing-site", fullName: "cool-startup/marketing-site", private: true, defaultBranch: "production" },
    { id: 105, name: "backend-api", fullName: "cool-startup/backend-api", private: true, defaultBranch: "main" },
    { id: 106, name: "react-components", fullName: "open-source-co/react-components", private: false, defaultBranch: "main" },
  ],
  9002: [
    { id: 201, name: "core-platform", fullName: "startup-inc/core-platform", private: true, defaultBranch: "main" },
    { id: 202, name: "mobile-app", fullName: "startup-inc/mobile-app", private: true, defaultBranch: "develop" },
    { id: 203, name: "analytics-service", fullName: "startup-inc/analytics-service", private: true, defaultBranch: "main" },
  ],
  9003: [
    { id: 301, name: "legacy-billing", fullName: "enterprise-corp/legacy-billing", private: true, defaultBranch: "trunk" },
    { id: 302, name: "frontend-monorepo", fullName: "enterprise-corp/frontend-monorepo", private: true, defaultBranch: "main" },
  ],
};

export const getMockInstallations = () => MOCK_INSTALLATIONS;
export const getMockRepos = (installationId: number) => MOCK_REPOS[installationId] || [];

export const getMockSignals = (repoId: number, timeframeDays: number) => {
  // Deterministic "random" generation based on repoId + timeframe
  // This allows the demo to feel consistent but responsive to changes.
  
  const baseScore = (repoId * 13) % 100; // distinct base per repo
  
  // Logic: Longer timeframes usually show more "settled" churn or accumulated debt.
  // Shorter timeframes might show spikes.
  let scoreModifier = 0;
  if (timeframeDays <= 7) scoreModifier = -10 + (repoId % 20); // Volatile
  if (timeframeDays >= 90) scoreModifier = 15; // Accumulated history

  let score = Math.min(100, Math.max(0, baseScore + scoreModifier));

  // Determine file churn based on context
  let churnFiles = [];
  
  if (repoId === 201) { // startup-inc/core-platform (High debt example)
    churnFiles = [
        { file: "src/users/UserController.ts", prCount: Math.ceil(timeframeDays / 3) + 2 },
        { file: "src/billing/StripeWebhooks.ts", prCount: Math.ceil(timeframeDays / 5) + 1 },
        { file: "migrations/schema.sql", prCount: Math.ceil(timeframeDays / 10) },
        { file: "config/features.json", prCount: Math.ceil(timeframeDays / 2) },
    ];
    score = Math.min(98, score + 20);
  } else if (repoId === 101) { // personal-portfolio (Clean example)
    churnFiles = [
        { file: "content/blog/new-post.md", prCount: Math.ceil(timeframeDays / 30) },
        { file: "styles/global.css", prCount: Math.ceil(timeframeDays / 14) },
    ];
    score = Math.max(5, score - 30);
  } else if (repoId === 302) { // enterprise-corp/frontend (Huge monorepo)
    churnFiles = [
        { file: "packages/ui-kit/Button.tsx", prCount: Math.ceil(timeframeDays / 2) + 5 },
        { file: "apps/dashboard/src/App.tsx", prCount: Math.ceil(timeframeDays / 4) + 3 },
        { file: "yarn.lock", prCount: Math.ceil(timeframeDays / 7) },
    ];
    score = 65 + (timeframeDays > 30 ? 10 : 0);
  } else {
    // Generic filler
    churnFiles = [
        { file: "README.md", prCount: 1 },
        { file: "package.json", prCount: 2 },
    ];
  }

  // Calculate previous score for trend
  const previousScore = Math.max(0, Math.min(100, score + (timeframeDays <= 7 ? (Math.random() > 0.5 ? 5 : -5) : (Math.random() > 0.5 ? 2 : -2))));

  return {
    score,
    previousScore,
    churnFiles
  };
};

export const getMockTruckFactor = (repoId: number, _timeframeDays: number) => {
    let riskScore = 0;
    if (repoId === 201) riskScore = 85; // High risk for startup
    if (repoId === 101) riskScore = 99; // Solo project
    const previousRiskScore = Math.max(0, riskScore - 10); // Risk increased recently

    const heroes = [];
    if (riskScore > 0) {
        heroes.push({ author: "cto-dave", fileCount: 42, topFiles: ["src/core/engine.ts", "src/auth/jwt.ts"] });
        if (riskScore < 90) heroes.push({ author: "senior-dev-sarah", fileCount: 28, topFiles: ["src/api/routes.ts"] });
    }

    return {
        riskScore,
        previousRiskScore,
        heroes,
        totalFiles: 150
    };
};

export const getMockPulse = (repoId: number, timeframeDays: number) => {
    const dailyActivity = [];
    const now = Date.now();
    let status = "Consistent";
    let score = 75;
    let previousScore = 70;

    // Simulate scenarios
    let intensity = 0.5; // Probability of activity per day
    let activityMultiplier = 5;

    if (repoId === 201) { // startup-inc (Busy)
        status = "High Cadence";
        score = 95;
        previousScore = 80;
        intensity = 0.9;
        activityMultiplier = 15;
    } else if (repoId === 102) { // obsidian-plugin (Abandoned)
        status = "Stagnant";
        score = 5;
        previousScore = 15; // Decreased
        intensity = 0.05;
        activityMultiplier = 1;
    } else if (repoId === 101) { // personal (Steady)
        status = "Consistent";
        score = 80;
        previousScore = 80; // Stable
        intensity = 0.6;
        activityMultiplier = 8;
    }

    for (let i = timeframeDays - 1; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        // Weighted random activity
        const hasActivity = Math.random() < intensity;
        const count = hasActivity ? Math.floor(Math.random() * activityMultiplier) + 1 : 0;
        
        dailyActivity.push({ date, count });
    }

    return {
        score,
        previousScore,
        status,
        dailyActivity
    };
};
