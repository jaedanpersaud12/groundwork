import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";

import { FOCUS_RING } from "./_site/styles";
import "./globals.css";

/**
 * Archivo carries both display and body. The width axis is loaded because the headline
 * voice is a width, not a weight — see `type-display` in globals.css.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "groundwork", template: "%s — groundwork" },
  description:
    "The foundation a new repo starts on: the skills and context your agents work from, a token contract your components can't break, and the gotchas you already paid for somewhere else.",
};

/**
 * Runs before first paint so a reload never flashes the wrong theme. Kept to one
 * statement and no dependencies — it is inlined into <head> and blocks rendering.
 */
const THEME_SCRIPT = `try{var t=localStorage.getItem("gw-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">
        {/* First tab stop on every page. Invisible until focused, so it costs sighted readers nothing. */}
        <a
          href="#content"
          className={`sr-only rounded-full bg-card px-4 py-2 text-sm text-card-foreground shadow-border focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 ${FOCUS_RING}`}
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
