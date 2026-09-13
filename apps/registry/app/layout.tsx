import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";

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
    "Components you copy into your project, one token contract they all obey, and the lint rule that fails the build when anything breaks it.",
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
