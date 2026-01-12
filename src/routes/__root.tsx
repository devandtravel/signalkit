import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import styleUrl from "../index.css?url";
import "../index.css";
import "../lib/i18n";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ConvexClientProvider>
        <Outlet />
      </ConvexClientProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const cssHref = styleUrl.split("?")[0];

  return (
    <html lang={i18n.language} className="dark">
      <head>
        <HeadContent />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SignalKit</title>
        <link rel="stylesheet" href={cssHref} />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
