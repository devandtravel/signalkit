import { useConvexAction } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "../../convex/_generated/api";

const searchSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/auth/github/callback")({
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  component: AuthCallback,
});

function AuthCallback() {
  const search = Route.useSearch() as { code?: string; error?: string };
  const exchangeCode = useConvexAction(api.auth.handleGitHubCallback);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");

  useEffect(() => {
    async function handleCallback() {
      if (search.error) {
        console.error("GitHub Auth Error:", search.error);
        setStatus("error");
        return;
      }

      if (!search.code) {
        setStatus("error");
        return;
      }

      try {
        const authType = localStorage.getItem("auth_type") || "oauth";
        const result = await exchangeCode({ code: search.code, authType });
        console.log("Logged in:", result);
        
        // MVP: Persist token for client-side API calls
        localStorage.setItem("github_user_id", result.userId);
        localStorage.setItem("github_access_token", result.accessToken);
        
        window.location.href = "/dashboard"; 
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    handleCallback();
  }, [search.code, search.error, exchangeCode]);

  if (status === "error") return <div>Authentication failed.</div>;

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-lg font-mono">Authenticating with GitHub...</div>
    </div>
  );
}
