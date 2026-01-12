import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { GitHubIcon } from "../components/icons";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export const Route = createFileRoute("/")({
  component: Index,
});

export default function Index() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDemo = (authType: "oauth" | "app") => {
    localStorage.setItem("is_demo_mode", "true");
    localStorage.setItem("auth_type", authType);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground selection:bg-green-500/30">
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="font-mono text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          SIGNALKIT
        </div>
        <LanguageSwitcher />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-4 text-center max-w-7xl mx-auto w-full">
        <div className="max-w-4xl space-y-6">
          <h1 className="text-6xl font-black tracking-tight sm:text-8xl lg:text-9xl leading-[0.9]">
            {t("landing.hero_title_part1")}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-500">
              {t("landing.hero_title_part2")}
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-500 sm:text-xl font-medium">
            {t("landing.hero_description_part1")}{" "}
            <span className="text-zinc-200">
              "{t("landing.hero_description_timesinks")}"
            </span>{" "}
            {t("landing.hero_description_part2")}
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              onClick={() => handleDemo("oauth")}
              className="h-14 px-8 rounded-full bg-zinc-100 text-zinc-950 hover:bg-white gap-3 text-base font-bold transition-all hover:scale-105 active:scale-95"
              type="button"
            >
              <GitHubIcon size={20} title="GitHub" />
              {t("landing.standard_login")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleDemo("app")}
              className="h-14 px-8 rounded-full border-zinc-800 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-800 gap-3 text-base font-bold transition-all hover:scale-105 active:scale-95"
              type="button"
            >
              {t("landing.connect_github_app")}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center opacity-50 hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDemo("oauth")}
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-green-400 transition-colors"
              type="button"
            >
              {t("landing.demo_oauth")}
            </button>
            <button
              onClick={() => handleDemo("app")}
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-green-400 transition-colors"
              type="button"
            >
              {t("landing.demo_app")}
            </button>
          </div>
        </div>

        <div className="grid w-full max-w-5xl gap-6 md:grid-cols-3 mt-12">
          <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-sm group hover:border-zinc-700 transition-colors">
            <CardHeader>
              <CardTitle className="text-zinc-100 group-hover:text-green-400 transition-colors">{t("landing.features.time_sink.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-500 leading-relaxed text-sm font-medium">{t("landing.features.time_sink.desc")}</CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-sm group hover:border-zinc-700 transition-colors">
            <CardHeader>
              <CardTitle className="text-zinc-100 group-hover:text-green-400 transition-colors">{t("landing.features.privacy.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-500 leading-relaxed text-sm font-medium">{t("landing.features.privacy.desc")}</CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-sm group hover:border-zinc-700 transition-colors">
            <CardHeader>
              <CardTitle className="text-zinc-100 group-hover:text-green-400 transition-colors">{t("landing.features.instant.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-500 leading-relaxed text-sm font-medium">{t("landing.features.instant.desc")}</CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700">
        <p>&copy; 2026 SignalKit. <span className="text-zinc-500">{t("common.built_by")}</span></p>
      </footer>
    </div>
  );
}
