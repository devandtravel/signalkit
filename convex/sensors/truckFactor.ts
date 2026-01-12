import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Calculates "Truck Factor" (Bus Factor) Risk.
 * Identification of "Hero Files" - files touched predominantly by a single author.
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

    const repo = await ctx.runQuery(internal.sensors.dal.getRepoByGithubId, {
      githubRepoId: String(args.githubRepoId),
    });

    if (!repo) {
      return { riskScore: 0, previousRiskScore: 0, heroes: [] };
    }

    const allEvents = await ctx.runQuery(internal.sensors.dal.getEventsForTimeframe, {
      repoId: repo._id,
      startTime: previousStart,
    });

    const calculateRisk = (events: typeof allEvents) => {
        // File -> Author -> Count
        const fileAuthors: Record<string, Record<string, number>> = {};
        const fileTotalTouches: Record<string, number> = {};

        // 1. Build PR Author Map
        const prAuthors: Record<number, string> = {};
        for (const event of events) {
          if (event.type === 'pr_merged' && event.data.prId && event.data.author) {
            prAuthors[event.data.prId] = event.data.author;
          }
        }

        // 2. Tally File Touches by Author
        for (const event of events) {
          if (event.type === 'file_change' && event.data.file && event.data.prId) {
            const file = event.data.file as string;
            const prId = event.data.prId;
            if (file.endsWith(".lock") || file.includes("dist/") || file.includes("node_modules/")) continue;

            const author = prAuthors[prId];
            if (!author) continue;

            if (!fileAuthors[file]) fileAuthors[file] = {};
            if (!fileTotalTouches[file]) fileTotalTouches[file] = 0;

            fileAuthors[file][author] = (fileAuthors[file][author] || 0) + 1;
            fileTotalTouches[file]++;
          }
        }

        // 3. Identify High Risk Files (Hero Files)
        const heroes: Record<string, { fileCount: number; files: string[] }> = {};
        let totalSignificantFiles = 0;
        let totalHeroFiles = 0;

        for (const [file, authors] of Object.entries(fileAuthors)) {
          const total = fileTotalTouches[file];
          if (total < 3) continue; 
          totalSignificantFiles++;

          let dominantAuthor = null;
          for (const [author, count] of Object.entries(authors)) {
            if (count / total > 0.7) {
              dominantAuthor = author;
              break;
            }
          }

          if (dominantAuthor) {
            totalHeroFiles++;
            if (!heroes[dominantAuthor]) heroes[dominantAuthor] = { fileCount: 0, files: [] };
            heroes[dominantAuthor].fileCount++;
            if (heroes[dominantAuthor].files.length < 5) heroes[dominantAuthor].files.push(file);
          }
        }

        // 4. Calculate Risk
        const heroRatio = totalSignificantFiles > 0 ? totalHeroFiles / totalSignificantFiles : 0;
        const riskScore = Math.min(100, Math.round(heroRatio * 200));

        const heroList = Object.entries(heroes)
          .map(([author, data]) => ({ author, fileCount: data.fileCount, topFiles: data.files }))
          .sort((a, b) => b.fileCount - a.fileCount);

        return { riskScore, heroList, totalSignificantFiles };
    };

    const currentEvents = allEvents.filter(e => e.ts >= currentStart);
    const previousEvents = allEvents.filter(e => e.ts >= previousStart && e.ts < currentStart);

    const currentMetrics = calculateRisk(currentEvents);
    const previousMetrics = calculateRisk(previousEvents);

    return {
      riskScore: currentMetrics.riskScore,
      previousRiskScore: previousMetrics.riskScore,
      heroes: currentMetrics.heroList,
      totalFiles: currentMetrics.totalSignificantFiles
    };
  },
});
