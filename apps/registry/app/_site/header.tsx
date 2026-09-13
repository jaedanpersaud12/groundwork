import Link from "next/link";

import { cn } from "@/lib/utils";

import { FOCUS_RING } from "./styles";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/docs", label: "Start here" },
  { href: "/docs/loop", label: "The loop" },
  { href: "/docs/context", label: "Context" },
  { href: "/docs/knowledge", label: "Knowledge" },
  { href: "/docs/tokens", label: "Tokens" },
];

/**
 * `plate` floats the header over the hero illustration; `solid` sticks it to the top of
 * a docs page. Same contents, so the wordmark doesn't move between the two.
 */
function SiteHeader({ variant }: { variant: "plate" | "solid" }) {
  const plate = variant === "plate";
  return (
    <header
      className={cn(
        "z-30",
        plate ? "absolute inset-x-0 top-0" : "sticky top-0 border-b border-border bg-background/85 backdrop-blur",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className={cn("type-display shrink-0 rounded-sm text-lg text-foreground", FOCUS_RING)}
        >
          groundwork
        </Link>

        <nav
          aria-label="Sections"
          className={cn(
            "mx-auto hidden items-center gap-1 rounded-full p-1 md:flex",
            plate && "bg-card/70 backdrop-blur-sm",
          )}
        >
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

        <div className={cn("flex shrink-0 items-center gap-2", !plate && "ms-auto", plate && "ms-auto md:ms-0")}>
          <ThemeToggle />
          <Link
            href="/docs"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              FOCUS_RING,
              plate
                ? "bg-card text-card-foreground shadow-border hover:bg-accent hover:text-accent-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
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
