import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

/**
 * Stores or updates a user after GitHub Login.
 */
export const storeUser = mutation({
  args: {
    githubUserId: v.string(),
    login: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_githubUserId", (q) => q.eq("githubUserId", args.githubUserId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        login: args.login,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        githubUserId: args.githubUserId,
        login: args.login,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
    }
  },
});

/**
 * Exchanges the temporary code for an access token and user profile,
 * then stores the user in Convex.
 */
export const handleGitHubCallback = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
    authType: v.optional(v.string()), // "oauth" | "app"
  },
  handler: async (ctx, args): Promise<{ userId: string; login: string; accessToken: string }> => {
    let clientId = process.env.AUTH_GITHUB_ID;
    let clientSecret = process.env.AUTH_GITHUB_SECRET;

    if (args.authType === "app") {
      clientId = process.env.GITHUB_APP_CLIENT_ID;
      clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
    }

    if (!clientId || !clientSecret) {
      throw new Error(`Missing GitHub Auth Environment Variables for ${args.authType || "oauth"}`);
    }

    // 1. Exchange Code for Token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: args.code,
        redirect_uri: args.redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(`GitHub Token Error: ${tokenData.error_description || "Unknown error"}`);
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "SignalKit-Convex",
      },
    });

    const userData = await userResponse.json();
    if (!userData.id) {
      throw new Error("Failed to fetch GitHub user profile");
    }

    // 3. Store User in Convex
    const userId = await ctx.runMutation(api.auth.storeUser, {
      githubUserId: String(userData.id),
      login: userData.login,
      name: userData.name,
      avatarUrl: userData.avatar_url,
    });

    // 4. Return Session Info (For client to store in localStorage/cookie if needed,
    // or just to confirm success)
    return {
      userId,
      login: userData.login,
      accessToken, // NOTE: In a real app, storing this on client is risky.
      // Ideally we keep it in httpOnly cookie or Convex internal.
      // For MVP, we pass it back to let client use it for immediate API calls if needed,
      // but strictly for this spec we only need it to identify Viewer.
    };
  },
});

/**
 * Get current user by GitHub ID (used for session validation).
 */
export const getUser = query({
  args: { githubUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_githubUserId", (q) => q.eq("githubUserId", args.githubUserId))
      .first();
  },
});
