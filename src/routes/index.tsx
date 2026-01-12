import { createFileRoute } from "@tanstack/react-router";
import { loginWithOAuth, loginWithGitHubApp } from "../lib/github-auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="font-mono text-xl font-bold tracking-tighter">SIGNALKIT</div>

      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Stop Engineering{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
              Rework.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            SignalKit analyzes your GitHub history to find hidden <span className="text-foreground font-semibold">"time sinks"</span> in your development process. No vanity metrics, just actionable signals.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" onClick={loginWithOAuth} className="gap-2 text-base">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                 <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Standard Login
            </Button>
            <Button size="lg" variant="outline" onClick={loginWithGitHubApp} className="gap-2 text-base">
              Connect GitHub App
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <Button 
                    size="lg" 
                    variant="ghost" 
                    className="gap-2 text-sm text-muted-foreground hover:text-foreground border border-transparent hover:border-gray-800"
                    onClick={() => {
                        localStorage.setItem("is_demo_mode", "true");
                        localStorage.setItem("auth_type", "oauth");
                        window.location.href = "/dashboard";
                    }}
                >
                  Demo (Standard OAuth)
                </Button>
                <Button 
                    size="lg" 
                    variant="ghost" 
                    className="gap-2 text-sm text-muted-foreground hover:text-foreground border border-transparent hover:border-gray-800"
                    onClick={() => {
                        localStorage.setItem("is_demo_mode", "true");
                        localStorage.setItem("auth_type", "app");
                        window.location.href = "/dashboard";
                    }}
                >
                  Demo (GitHub App)
                </Button>
            </div>
          <p className="text-xs text-muted-foreground">
            * Standard Login for public data. Connect App for private repo access & webhooks.
          </p>
        </div>

        <Separator className="my-12 w-full max-w-sm" />

        {/* Features Bento */}
        <div className="grid w-full max-w-5xl gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Time Sink Metric</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Identifies code that is constantly being rewritten across multiple PRs.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
              <CardTitle>Privacy First</CardTitle>
            </CardHeader>
             <CardContent>
              <CardDescription>
                We only analyze metadata and stats. Your source code never leaves GitHub.
              </CardDescription>
            </CardContent>
          </Card>
           <Card>
             <CardHeader>
              <CardTitle>Instant Analysis</CardTitle>
            </CardHeader>
             <CardContent>
              <CardDescription>
                Connect a repo and get insights in seconds. No complex setup required.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 SignalKit. Built for engineers who value flow.</p>
      </footer>
    </div>
  );
}
