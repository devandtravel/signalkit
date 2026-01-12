import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    githubUserId: v.string(),
    login: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  }).index("by_githubUserId", ["githubUserId"]),

  accounts: defineTable({
    githubAccountId: v.string(), // User or Org ID
    login: v.string(),
    type: v.union(v.literal("User"), v.literal("Organization")),
    installationId: v.string(),
  }).index("by_githubAccountId", ["githubAccountId"]),

  repos: defineTable({
    accountId: v.optional(v.id("accounts")),
    githubRepoId: v.string(),
    name: v.string(),
    fullName: v.string(),
    isPrivate: v.boolean(),
  })
    .index("by_accountId", ["accountId"])
    .index("by_githubRepoId", ["githubRepoId"]),

  events: defineTable({
    repoId: v.id("repos"),
    type: v.union(v.literal("pr_merged"), v.literal("git_push"), v.literal("file_change")),
    ts: v.number(),
    data: v.any(), // Normalized payload
  })
    .index("by_repo_ts", ["repoId", "ts"])
    .index("by_repo_type_ts", ["repoId", "type", "ts"]),

  sensor_snapshots: defineTable({
    repoId: v.id("repos"),
    sensorId: v.string(),
    timeframeDays: v.number(),
    computedAt: v.number(),
    result: v.any(), // SensorResult JSON
  }).index("by_repo_sensor_timeframe", ["repoId", "sensorId", "timeframeDays"]),
});
