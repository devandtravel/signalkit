import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

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
