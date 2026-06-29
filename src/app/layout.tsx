// filepath: src/app/layout.tsx
/**
 * Root application layout.
 * Injects providers, fonts, and global structure.
 */

import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "NERV DEEP SPACE DEFENSE GRID // LONGINUS WATCH",
  description: "ANGEL APPROACH SYSTEM — CLASSIFICATION: TOP SECRET // GEHIRN EYES ONLY",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full overflow-hidden bg-void-black text-amber-core">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
