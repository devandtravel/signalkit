/**
 * Initiates the GitHub OAuth flow.
 * Redirects the browser to GitHub's authorization page.
 */
// Basic OAuth App (Simple Login)
export function loginWithOAuth() {
  const clientId = import.meta.env.VITE_AUTH_GITHUB_ID;

  if (!clientId) {
    console.error("Missing VITE_AUTH_GITHUB_ID env var");
    return;
  }

  // Store auth type so callback knows which secrets to use
  localStorage.setItem("auth_type", "oauth");

  const redirectUri = window.location.origin + "/auth/github/callback";
  const scope = "repo read:org read:user user:email"; // Expanded scopes for private/org access

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}

// GitHub App (Installation Flow)
export function loginWithGitHubApp() {
  const clientId = import.meta.env.VITE_GITHUB_APP_CLIENT_ID;

  if (!clientId) {
    console.error("Missing VITE_GITHUB_APP_CLIENT_ID env var. Make sure it is set in .env");
    return;
  }

  localStorage.setItem("auth_type", "app");

  const redirectUri = window.location.origin + "/auth/github/callback";
  const scope = "read:user user:email"; 

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}
