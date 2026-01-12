import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

type PulseStatus = "Stagnant" | "Low Activity" | "Sporadic" | "Consistent" | "High Cadence";

/**
 * Calculates "Pulse" (Project Activity/Liveness).
 * Analyzes the cadence and consistency of development activity.
 */
export const compute = action({
  args: {
    githubRepoId: v.number(),
    timeframeDays: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const currentStart = now - args.timeframeDays * 24 * 60 * 60 * 1000;
    const previousStart = now - 2 * args.timeframeDays * 24 * 60 * 60 * 1000;

    const repo = await ctx.runQuery(internal.sensors.dal.getRepoByGithubId, {
      githubRepoId: String(args.githubRepoId),
    });

    if (!repo) {
      return { score: 0, previousScore: 0, status: "Stagnant" as PulseStatus, dailyActivity: [] };
    }

    const allEvents = await ctx.runQuery(internal.sensors.dal.getEventsForTimeframe, {
      repoId: repo._id,
      startTime: previousStart,
    });

    const calculatePulse = (events: typeof allEvents, timeframeDays: number) => {
        if (events.length === 0) {
            return { score: 0, status: "Stagnant" as PulseStatus, dailyActivity: [] };
        }

        const activityMap: Record<string, number> = {};
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        // Note: For 'dailyActivity' return, strictly usually only want current.
        // But for score calc, we need to map days.
        
        for (const event of events) {
            const dateStr = new Date(event.ts).toISOString().split('T')[0];
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
        }

        const dailyActivity = Object.entries(activityMap)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const activeDays = dailyActivity.length; // Approximate, if map only has active
        // Better: activeRatio based on timeframe
        const activeRatio = activeDays / timeframeDays;

        let status: PulseStatus = "Stagnant";
        let score = 0;

        if (activeRatio === 0) {
            status = "Stagnant";
            score = 0;
        } else if (activeRatio < 0.2) {
            status = "Low Activity";
            score = 20;
        } else if (activeRatio < 0.5) {
            status = "Sporadic";
            score = 50;
        } else if (activeRatio < 0.8) {
            status = "Consistent";
            score = 80;
        } else {
            status = "High Cadence";
            score = 100;
        }
        
        return { score, status, dailyActivity };
    };

    const currentEvents = allEvents.filter(e => e.ts >= currentStart);
    const previousEvents = allEvents.filter(e => e.ts >= previousStart && e.ts < currentStart);

    const currentMetrics = calculatePulse(currentEvents, args.timeframeDays);
    const previousMetrics = calculatePulse(previousEvents, args.timeframeDays);

    // Re-fill dailyActivity with zeros for current timeframe for nice heatmap
    const oneDayMs = 24 * 60 * 60 * 1000;
    const finalDailyActivity = [];
    const currentActivityMap: Record<string, number> = {};
    if (currentMetrics.dailyActivity) {
        for (const item of currentMetrics.dailyActivity) currentActivityMap[item.date] = item.count;
    }
    
    for (let i = args.timeframeDays - 1; i >= 0; i--) {
       const dateStr = new Date(now - i * oneDayMs).toISOString().split('T')[0];
       finalDailyActivity.push({
           date: dateStr,
           count: currentActivityMap[dateStr] || 0
       });
    }

    return {
      score: currentMetrics.score,
      previousScore: previousMetrics.score,
      status: currentMetrics.status,
      dailyActivity: finalDailyActivity 
    };
  },
});
