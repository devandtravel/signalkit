import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Calculates the "Time Sink" metric for a repository.
 * Time Sink = Percentage of file churn that happens after the first touch in a timeframe.
 * High Time Sink means the same files are being reworked in multiple PRs.
 */
export const compute = action({
  args: {
    githubRepoId: v.number(),
    timeframeDays: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Calculate timeframe windows
    const now = Date.now();
    const currentStart = now - args.timeframeDays * 24 * 60 * 60 * 1000;
    const previousStart = now - 2 * args.timeframeDays * 24 * 60 * 60 * 1000;

    // Lookup internal ID
    const repo = await ctx.runQuery(internal.sensors.dal.getRepoByGithubId, {
      githubRepoId: String(args.githubRepoId),
    });

    if (!repo) {
      return { score: 0, previousScore: 0, totalTouches: 0, reworkTouches: 0, churnFiles: [] };
    }

    // 2. Fetch all events for this repo in the EXTENDED timeframe (2x)
    const allEvents = await ctx.runQuery(internal.sensors.dal.getEventsForTimeframe, {
      repoId: repo._id,
      startTime: previousStart,
    });

    // 3. Helper to calculate score for a set of events
    const calculateScore = (events: typeof allEvents) => {
        const fileHistory: Record<string, Set<number>> = {};
        let total = 0;
        let rework = 0;
        
        // Filter and Sort
        const fileEvents = events
            .filter((e: any) => e.type === "file_change")
            .sort((a: any, b: any) => a.ts - b.ts);

        for (const event of fileEvents) {
            if (!event.data.file) continue;
            const file = event.data.file as string;
            // Basic filtering
            if (file.endsWith(".lock") || file.includes("dist/") || file.endsWith(".map")) continue;

            const prId = event.data.prId;
            if (!fileHistory[file]) fileHistory[file] = new Set();

            const isFirstTouch = fileHistory[file].size === 0;
            total++;

            if (!isFirstTouch && !fileHistory[file].has(prId)) {
                rework++;
            }
            fileHistory[file].add(prId);
        }

        const score = total === 0 ? 0 : Math.round((rework / total) * 100);
        
        // Top churn files (only needed for current timeframe usually, but logic is here)
        const churnFiles = Object.entries(fileHistory)
            .map(([file, prs]) => ({ file, prCount: prs.size }))
            .filter((f) => f.prCount > 1)
            .sort((a, b) => b.prCount - a.prCount)
            .slice(0, 5);
        
        return { score, total, rework, churnFiles };
    };

    // Split events
    const currentEvents = allEvents.filter(e => e.ts >= currentStart);
    const previousEvents = allEvents.filter(e => e.ts >= previousStart && e.ts < currentStart);

    const currentMetrics = calculateScore(currentEvents);
    const previousMetrics = calculateScore(previousEvents);

    return {
      score: currentMetrics.score, // 0 to 100
      previousScore: previousMetrics.score,
      totalTouches: currentMetrics.total,
      reworkTouches: currentMetrics.rework,
      churnFiles: currentMetrics.churnFiles,
    };
  },
});
