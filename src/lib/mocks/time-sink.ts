export const getMockSignals = (repoId: number, timeframeDays: number) => {
  const baseScore = (repoId * 17) % 100;
  
  let scoreModifier = 0;
  if (timeframeDays <= 7) scoreModifier = -15 + (repoId % 30);
  if (timeframeDays >= 90) scoreModifier = 20;

  let score = Math.min(100, Math.max(0, baseScore + scoreModifier));
  let churnFiles = [];

  // Archetypes logic
  if (repoId >= 300 && repoId < 400) { // Enterprise Legacy
    churnFiles = [
      { file: "Legacy/Billing/Core.cs", prCount: Math.ceil(timeframeDays / 2) + 5 },
      { file: "Legacy/Common/Utils.cs", prCount: Math.ceil(timeframeDays / 4) + 2 },
      { file: "Database/Procedures/UpdateBilling.sql", prCount: Math.ceil(timeframeDays / 10) + 3 },
      { file: "Global.asax", prCount: 1 },
    ];
    score = Math.min(95, score + 30);
  } else if (repoId >= 200 && repoId < 300) { // Startup
    churnFiles = [
      { file: "src/api/v1/endpoints.ts", prCount: Math.ceil(timeframeDays / 3) + 4 },
      { file: "src/models/User.ts", prCount: Math.ceil(timeframeDays / 5) + 2 },
      { file: "package.json", prCount: Math.ceil(timeframeDays / 14) + 1 },
      { file: "kubernetes/deployment.yaml", prCount: 2 },
    ];
    score = Math.min(85, score + 10);
  } else if (repoId >= 500) { // Hobby
    churnFiles = [
      { file: "src/main.rs", prCount: Math.ceil(timeframeDays / 20) + 1 },
      { file: "README.md", prCount: 1 },
    ];
    score = Math.max(5, score - 20);
  } else {
    churnFiles = [
      { file: "src/index.ts", prCount: 3 },
      { file: "src/utils.ts", prCount: 2 },
    ];
  }

  const previousScore = Math.max(0, Math.min(100, score + (timeframeDays <= 7 ? (Math.random() > 0.5 ? 8 : -8) : (Math.random() > 0.5 ? 3 : -3))));

  return {
    score,
    previousScore,
    churnFiles
  };
};
