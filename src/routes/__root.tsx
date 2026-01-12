import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import type { ReactNode } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import i18n from "../lib/i18n";
import "../index.css";

const getLangServer = createServerFn({ method: "GET" }).handler(async () => {
  return getCookie("i18next") || "en";
});

export const Route = createRootRoute({
  loader: async () => {
    const lang = await getLangServer();
    return { lang };
  },
  component: RootComponent,
});

function RootComponent() {
  const { lang } = Route.useLoaderData();

  // Ensure the i18n instance matches the detected language during SSR
  if (typeof window === "undefined" && i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }

  return (
    <I18nextProvider i18n={i18n}>
      <RootDocument>
        <ConvexClientProvider>
          <Outlet />
        </ConvexClientProvider>
      </RootDocument>
    </I18nextProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  const { i18n: tInstance } = useTranslation();

  return (
    <html lang={tInstance.language} className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SignalKit</title>
      </head>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
