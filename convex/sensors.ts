import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery } from "./_generated/server";

/**
 * Ingests a batch of normalized GitHub events.
 * Currently supports 'pr_merged' and 'file_change'.
 */
export const ingestEvents = internalMutation({
  args: {
    repo: v.object({
      id: v.number(),
      name: v.string(),
      fullName: v.string(),
      private: v.boolean(),
    }),
    events: v.array(
      v.object({
        type: v.union(v.literal("pr_merged"), v.literal("file_change")),
        prId: v.number(), // The GitHub PR number
        payload: v.object({
          file: v.optional(v.string()), // For file_change
          additions: v.optional(v.number()), // For file_change
          deletions: v.optional(v.number()), // For file_change
          mergedAt: v.optional(v.string()), // For pr_merged
          author: v.optional(v.string()), // For pr_merged
        }),
        timestamp: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // 1. Ensure Repo exists
    let repoId: Id<"repos">;
    const existingRepo = await ctx.db
      .query("repos")
      .withIndex("by_githubRepoId", (q) => q.eq("githubRepoId", String(args.repo.id)))
      .first();

    if (existingRepo) {
      repoId = existingRepo._id;
      // Update metadata if needed
      await ctx.db.patch(repoId, {
        name: args.repo.name,
        fullName: args.repo.fullName,
        isPrivate: args.repo.private,
      });
    } else {
      repoId = await ctx.db.insert("repos", {
        githubRepoId: String(args.repo.id),
        name: args.repo.name,
        fullName: args.repo.fullName,
        isPrivate: args.repo.private,
      });
    }

    // 2. Insert Events
    for (const event of args.events) {
      await ctx.db.insert("events", {
        type: event.type,
        repoId: repoId,
        ts: event.timestamp,
        data: {
          prId: event.prId,
          ...event.payload,
        },
      });
    }
  },
});

/**
 * Calculates the "Time Sink" metric for a repository.
 * Time Sink = Percentage of file churn that happens after the first touch in a timeframe.
 * High Time Sink means the same files are being reworked in multiple PRs.
 */
export const computeTimeSink = action({
  args: {
    githubRepoId: v.number(),
    timeframeDays: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Calculate timeframe window
    const now = Date.now();
    const startTime = now - args.timeframeDays * 24 * 60 * 60 * 1000;

    // Lookup internal ID
    const repo = await ctx.runQuery(internal.sensors.getRepoByGithubId, {
      githubRepoId: String(args.githubRepoId),
    });

    if (!repo) {
      return { score: 0, totalTouches: 0, reworkTouches: 0, churnFiles: [] };
    }

    // 2. Fetch all events for this repo in the timeframe
    const events = await ctx.runQuery(internal.sensors.getEventsForTimeframe, {
      repoId: repo._id,
      startTime,
    });

    // 3. Process File Changes
    const fileHistory: Record<string, Set<number>> = {}; // file -> Set of PR IDs
    let totalTouches = 0;
    let reworkTouches = 0;

    // Filter for file_change events
    const fileEvents = events.filter((e) => e.type === "file_change");

    // Sort by time (should be sorted by index, but ensure)
    fileEvents.sort((a, b) => a.ts - b.ts);

    for (const event of fileEvents) {
      if (!event.data.file) continue;
      const file = event.data.file as string;

      // Basic filtering for noise (MVP)
      if (file.endsWith(".lock") || file.includes("dist/") || file.endsWith(".map")) {
        continue;
      }

      const prId = event.data.prId;

      if (!fileHistory[file]) {
        fileHistory[file] = new Set();
      }

      const isFirstTouch = fileHistory[file].size === 0;
      totalTouches++;

      if (!isFirstTouch && !fileHistory[file].has(prId)) {
        reworkTouches++;
      }

      fileHistory[file].add(prId);
    }

    const score = totalTouches === 0 ? 0 : Math.round((reworkTouches / totalTouches) * 100);

    // Get top churn files
    const churnFiles = Object.entries(fileHistory)
      .map(([file, prs]) => ({ file, prCount: prs.size }))
      .filter((f) => f.prCount > 1)
      .sort((a, b) => b.prCount - a.prCount)
      .slice(0, 5);

    return {
      score, // 0 to 100
      totalTouches,
      reworkTouches,
      churnFiles,
    };
  },
});

export const getEventsForTimeframe = internalQuery({
  args: {
    repoId: v.id("repos"),
    startTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_repo_ts", (q) => q.eq("repoId", args.repoId).gte("ts", args.startTime))
      .collect();
  },
});

export const getRepoByGithubId = internalQuery({
  args: { githubRepoId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("repos")
      .withIndex("by_githubRepoId", (q) => q.eq("githubRepoId", args.githubRepoId))
      .first();
  },
});
