import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

// GitHub API Interfaces
interface GitHubAccount {
  login: string;
  avatar_url: string;
  type: string;
}

interface GitHubInstallation {
  id: number;
  account: GitHubAccount;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
}

interface GitHubUser {
  login: string;
}

interface GitHubPR {
  number: number;
  merged_at: string | null;
  user: GitHubUser;
  updated_at: string;
}

interface GitHubFile {
  filename: string;
  additions: number;
  deletions: number;
}

// Internal Event Interface
interface IngestEvent {
  type: "pr_merged" | "file_change";
  prId: number;
  payload: {
    file?: string;
    additions?: number;
    deletions?: number;
    mergedAt?: string;
    author?: string;
  };
  timestamp: number;
}

/**
 * Fetches the GitHub App installations accessible to the user.
 * Requires the User's OAuth Access Token.
 */
// ... (interfaces remain)

/**
 * Fetches the GitHub App installations accessible to the user.
 * Requires the User's OAuth Access Token.
 */
export const fetchInstallations = action({
  args: { accessToken: v.string() },
  handler: async (_ctx, args) => {
    const headers = {
      Authorization: `Bearer ${args.accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SignalKit-Convex",
    };

    const res = await fetch("https://api.github.com/user/installations", {
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      return data.installations.map((inst: GitHubInstallation) => ({
        id: inst.id,
        account: {
          login: inst.account.login,
          avatarUrl: inst.account.avatar_url,
          type: inst.account.type,
        },
      }));
    }

    // Fallback for OAuth Apps (not GitHub Apps): Return the authenticated user as a "Personal" scope
    console.warn("Failed to fetch installations, falling back to personal user scope.");
    const userRes = await fetch("https://api.github.com/user", { headers });
    if (!userRes.ok) {
      throw new Error(`Failed to fetch installations or user: ${res.statusText}`);
    }
    const user = await userRes.json();
    return [{
      id: user.id, // Using User ID as the "Installation ID" context
      account: {
        login: user.login,
        avatarUrl: user.avatar_url,
        type: "User",
      },
    }];
  },
});

/**
 * Fetches repositories for a specific installation.
 * Uses the User's OAuth Token to list accessible repos for that installation.
 */
export const fetchRepos = action({
  args: {
    accessToken: v.string(),
    installationId: v.number(),
  },
  handler: async (_ctx, args) => {
    const headers = {
      Authorization: `Bearer ${args.accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SignalKit-Convex",
    };

    const res = await fetch(
      `https://api.github.com/user/installations/${args.installationId}/repositories`,
      { headers },
    );

    if (res.ok) {
      const data = await res.json();
      return data.repositories.map((repo: GitHubRepo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        defaultBranch: repo.default_branch,
      }));
    }

    // Fallback: Check if we can fetch user repos directly (OAuth mode)
    // We assume if specific installation fetch fails, we try the general user repos
    console.warn("Failed to fetch installation repos, falling back to user repos.");
    const userReposRes = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member",
      { headers }
    );

    if (!userReposRes.ok) {
        throw new Error(`Failed to fetch repos: ${res.statusText} / ${userReposRes.statusText}`);
    }
    
    const repos = await userReposRes.json();
    return repos.map((repo: GitHubRepo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        defaultBranch: repo.default_branch,
    }));
  },
});

/**
 * Syncs merged PRs and their files for a given repository.
 */
export const syncRepo = action({
  args: {
    accessToken: v.string(),
    repoId: v.number(),
    repoName: v.string(), // "owner/repo"
    repoFullName: v.string(),
    repoPrivate: v.boolean(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20; // Default to 20 recent PRs for MVP speed
    const headers = {
      Authorization: `Bearer ${args.accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SignalKit-Convex",
    };

    console.log(`Syncing ${args.repoName}, limit: ${limit}`);

    // 1. Fetch Merged PRs
    const prsRes = await fetch(
      `https://api.github.com/repos/${args.repoName}/pulls?state=closed&sort=updated&direction=desc&per_page=${limit}`,
      { headers },
    );

    if (!prsRes.ok) {
      throw new Error(`Failed to fetch PRs: ${prsRes.statusText}`);
    }

    const prs = await prsRes.json();
    const mergedPrs = prs.filter(
      (pr: GitHubPR): pr is GitHubPR & { merged_at: string } => !!pr.merged_at,
    );

    const eventsToIngest: IngestEvent[] = [];

    // 2. Process each PR
    for (const pr of mergedPrs) {
      const prNumber = pr.number;

      // Add PR Merged Event
      eventsToIngest.push({
        type: "pr_merged",
        prId: prNumber,
        payload: {
          mergedAt: pr.merged_at,
          author: pr.user.login,
        },
        timestamp: new Date(pr.merged_at).getTime(),
      });

      // 3. Fetch Files for PR
      const filesRes = await fetch(
        `https://api.github.com/repos/${args.repoName}/pulls/${prNumber}/files`,
        { headers },
      );

      if (filesRes.ok) {
        const files: GitHubFile[] = await filesRes.json();
        for (const file of files) {
          // Flatten file changes
          eventsToIngest.push({
            type: "file_change",
            prId: prNumber,
            payload: {
              file: file.filename,
              additions: file.additions,
              deletions: file.deletions,
            },
            timestamp: new Date(pr.merged_at).getTime(), // Use PR merge time for file event
          });
        }
      } else {
        console.error(`Failed to fetch files for PR #${prNumber}`);
      }
    }

    // 4. Send batch to Convex
    if (eventsToIngest.length > 0) {
      await ctx.runMutation(internal.sensors.ingestEvents, {
        repo: {
          id: args.repoId,
          name: args.repoName.split("/")[1] || args.repoName,
          fullName: args.repoFullName,
          private: args.repoPrivate,
        },
        events: eventsToIngest,
      });
    }

    return { count: eventsToIngest.length, prs: mergedPrs.length };
  },
});
