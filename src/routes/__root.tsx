import { createRootRoute, Outlet, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import styleUrl from "../index.css?url";

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
  const cssHref = styleUrl ? styleUrl.split('?')[0] : styleUrl;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SignalKit</title>
        <link rel="stylesheet" href={cssHref} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
