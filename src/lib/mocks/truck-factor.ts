export const getMockTruckFactor = (repoId: number, _timeframeDays: number) => {
  let riskScore = 0;
  let heroes = [];
  let totalFiles = 100 + (repoId % 500);

  // Archetypes logic
  if (repoId === 101 || repoId >= 500) { // Solo / Hobby Projects
    riskScore = 100;
    heroes = [{ author: "dev-explorer", fileCount: totalFiles, topFiles: ["src/main.ts", "README.md"] }];
  } else if (repoId >= 300 && repoId < 400) { // Enterprise
    riskScore = 25;
    heroes = [
      { author: "engineering-lead", fileCount: 15, topFiles: ["src/security/audit.ts"] },
      { author: "devops-guru", fileCount: 12, topFiles: ["infra/terraform/main.tf"] },
      { author: "backend-expert", fileCount: 10, topFiles: ["src/api/v1/auth.ts"] },
    ];
  } else if (repoId >= 200 && repoId < 300) { // Startup
    riskScore = 65;
    heroes = [
      { author: "founding-engineer", fileCount: 45, topFiles: ["src/core/engine.ts", "src/auth/logic.ts"] },
      { author: "early-hire", fileCount: 22, topFiles: ["src/api/routes.ts"] },
    ];
  } else {
    riskScore = 40;
    heroes = [
      { author: "maintainer-1", fileCount: 20, topFiles: ["src/utils.ts"] },
      { author: "maintainer-2", fileCount: 18, topFiles: ["src/lib.ts"] },
    ];
  }

  const previousRiskScore = Math.max(0, Math.min(100, riskScore + (Math.random() > 0.5 ? 5 : -5)));

  return {
    riskScore,
    previousRiskScore,
    heroes,
    totalFiles
  };
};
