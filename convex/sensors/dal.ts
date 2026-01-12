import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

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
