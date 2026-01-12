export const getMockPulse = (repoId: number, timeframeDays: number) => {
  const dailyActivity = [];
  const now = Date.now();
  let status = "Consistent";
  let score = 75;
  let previousScore = 70;

  let intensity = 0.5;
  let activityMultiplier = 5;

  // Archetypes logic
  if (repoId >= 200 && repoId < 300) { // Startup (High Cadence)
    status = "High Cadence";
    score = 90 + (repoId % 10);
    previousScore = score - 15;
    intensity = 0.85;
    activityMultiplier = 12;
  } else if (repoId >= 300 && repoId < 400) { // Enterprise (Consistent but slower)
    status = "Consistent";
    score = 60 + (repoId % 20);
    previousScore = score;
    intensity = 0.6;
    activityMultiplier = 20; // Big PRs
  } else if (repoId === 102) { // Specific dead repo
    status = "Stagnant";
    score = 5;
    previousScore = 12;
    intensity = 0.02;
    activityMultiplier = 1;
  } else if (repoId >= 500) { // Hobby (Sporadic)
    status = "Sporadic";
    score = 30 + (repoId % 40);
    previousScore = score + 5;
    intensity = 0.2;
    activityMultiplier = 3;
  }

  for (let i = timeframeDays - 1; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
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
