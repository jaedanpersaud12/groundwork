import Link from "next/link";

import { cn } from "@/lib/utils";

import { FOCUS_RING } from "./styles";
import { IslandHeader } from "./landing/island-header";
import { NAV } from "./nav";
import { ThemeToggle } from "./theme-toggle";


/**
 * `plate` is the landing page's header: a floating glass island (see island-header.tsx).
 * `solid` sticks to the top of a docs page. Same links and labels in both.
 */
function SiteHeader({ variant }: { variant: "plate" | "solid" }) {
  const plate = variant === "plate";

  if (plate) return <IslandHeader />;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className={cn("type-display shrink-0 rounded-sm text-lg text-foreground", FOCUS_RING)}
        >
          groundwork
        </Link>

        <nav aria-label="Sections" className="mx-auto hidden items-center gap-1 rounded-full p-1 md:flex">
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                FOCUS_RING,
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/docs"
            className={cn(
              "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              FOCUS_RING,
            )}
          >
            Browse the docs
          </Link>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader };
