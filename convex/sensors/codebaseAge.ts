import { v } from "convex/values";
import { action } from "../_generated/server";

export const compute = action({
  args: {
    githubRepoId: v.number(),
    timeframeDays: v.number(),
  },
  handler: async (_ctx, args) => {
    // This is a placeholder for real analysis.
    // In a real implementation, we would fetch package.json,
    // analyze file extensions, and scan for certain keywords.

    // For now, return a stable mock based on repoId
    const idStr = args.githubRepoId.toString();
    const isLegacy = idStr.includes("7") || idStr.includes("1"); // Random logic for demo

    if (isLegacy) {
      return {
        year: 2019,
        status: "Legacy Stack",
        points: [
          { marker: "React < 17", impact: "-2 years", status: "legacy" },
          { marker: "CommonJS detected", impact: "-2 years", status: "legacy" },
          { marker: "No Strict TS", impact: "-1 year", status: "legacy" },
        ],
      };
    }

    return {
      year: 2023,
      status: "Modern Stack",
      points: [
        { marker: "React 18+", impact: "+2 years", status: "modern" },
        { marker: "ESM Native", impact: "+1 year", status: "modern" },
        { marker: "Strict TypeScript", impact: "+1 year", status: "modern" },
      ],
    };
  },
});
