import { v } from "convex/values";
import { action } from "../_generated/server";

export const compute = action({
  args: {
    githubRepoId: v.number(),
    timeframeDays: v.number(),
    accessToken: v.optional(v.string()),
    repoName: v.optional(v.string()), // "owner/repo"
  },
  handler: async (_ctx, args) => {
    // Fallback to existing mock if no token/repo provided (prevents breaking existing calls immediately)
    if (!args.accessToken || !args.repoName) {
      const idStr = args.githubRepoId.toString();
      const isLegacy = idStr.includes("7") || idStr.includes("1");

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
    }

    const headers = {
      Authorization: `Bearer ${args.accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SignalKit-Convex",
    };

    const fetchFile = async (path: string) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${args.repoName}/contents/${path}`, {
          headers,
        });
        if (!res.ok) {
          console.log(`Fetch failed for ${path}: ${res.status}`);
          return null;
        }
        const data = await res.json();
        // GitHub API returns content in base64
        if (data.content && data.encoding === "base64") {
          const cleanContent = data.content.replace(/\s/g, "");
          if (typeof atob === "function") {
            return atob(cleanContent);
          }
          if (typeof Buffer === "function") {
            return Buffer.from(cleanContent, "base64").toString("utf-8");
          }
          console.error("No base64 decoder available");
          return null;
        }
        return null;
      } catch (e) {
        console.error(`Failed to fetch ${path}:`, e);
        return null;
      }
    };

    try {
      // Parallel fetch
      const [pkgJsonStr, tsConfigStr] = await Promise.all([
        fetchFile("package.json"),
        fetchFile("tsconfig.json"),
      ]);

      const points: { marker: string; impact: string; status: "legacy" | "modern" | "neutral" }[] =
        [];
      let baseYear = 2024;
      let isModern = true;

      // 1. Analyze package.json
      if (pkgJsonStr) {
        try {
          const pkg = JSON.parse(pkgJsonStr);
          if (typeof pkg !== "object" || pkg === null) {
            points.push({ marker: "Invalid package.json", impact: "Unknown", status: "neutral" });
          } else {
            // Check React Version
            const reactVer =
              pkg.dependencies?.react || pkg.devDependencies?.react || pkg.peerDependencies?.react;

            if (reactVer) {
              // Clean version string (remove ^, ~, etc)
              const cleanVer = reactVer.replace(/[\^~>=<]/g, "");
              const major = parseInt(cleanVer.split(".")[0], 10);

              if (major >= 18) {
                points.push({ marker: `React ${major}`, impact: "+2 years", status: "modern" });
              } else if (major >= 17) {
                points.push({ marker: `React ${major}`, impact: "Neutral", status: "neutral" });
                baseYear -= 1;
                isModern = false;
              } else {
                points.push({ marker: `React ${major}`, impact: "-2 years", status: "legacy" });
                baseYear -= 3;
                isModern = false;
              }
            }

            // Check Module System
            if (pkg.type === "module") {
              points.push({ marker: "ESM Native", impact: "+1 year", status: "modern" });
            } else {
              // Check if using a modern bundler that mitigates CJS
              const hasVite = pkg.devDependencies?.vite || pkg.dependencies?.vite;
              const hasNext = pkg.dependencies?.next;
              if (hasVite || hasNext) {
                points.push({
                  marker: "Bundled (Vite/Next)",
                  impact: "Neutral",
                  status: "neutral",
                });
              } else {
                points.push({ marker: "CommonJS detected", impact: "-2 years", status: "legacy" });
                baseYear -= 2;
                isModern = false;
              }
            }
          }
        } catch (e) {
          console.error("Error parsing package.json", e);
          points.push({ marker: "Parse Error", impact: "Unknown", status: "neutral" });
        }
      } else {
        points.push({ marker: "No package.json", impact: "Unknown", status: "neutral" });
      }

      // 2. Analyze tsconfig.json
      if (tsConfigStr) {
        try {
          const tsConfig = JSON.parse(
            tsConfigStr.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""),
          );

          const compilerOptions = tsConfig.compilerOptions || {};
          if (compilerOptions.strict === true) {
            points.push({ marker: "Strict TypeScript", impact: "+1 year", status: "modern" });
          } else {
            points.push({ marker: "No Strict TS", impact: "-1 year", status: "legacy" });
            baseYear -= 1;
            isModern = false;
          }
        } catch (_e) {
          // Fallback if relaxed JSON
          if (tsConfigStr.includes('"strict": true')) {
            points.push({ marker: "Strict TypeScript", impact: "+1 year", status: "modern" });
          } else {
            points.push({ marker: "TS Config Parse Error", impact: "Unknown", status: "neutral" });
          }
        }
      } else {
        // If it's a JS project, check if that's intended
        if (pkgJsonStr) {
          points.push({ marker: "No TypeScript", impact: "-1 year", status: "legacy" });
          baseYear -= 1;
          isModern = false;
        }
      }

      // Cap the year
      if (baseYear > 2025) baseYear = 2025;

      return {
        year: baseYear,
        status: isModern ? "Modern Stack" : "Legacy Stack",
        points,
      };
    } catch (err) {
      console.error("Critical error in codebaseAge compute:", err);
      // Fallback return to avoid 500
      return {
        year: 2024,
        status: "Unknown",
        points: [{ marker: "Analysis Failed", impact: "Unknown", status: "neutral" }],
      };
    }
  },
});
