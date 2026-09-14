import Link from "next/link";

import { cn } from "@/lib/utils";

import { FOCUS_RING } from "./styles";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/docs", label: "Start here" },
  { href: "/docs/loop", label: "The loop" },
  { href: "/docs/context", label: "Context" },
  { href: "/docs/knowledge", label: "Knowledge" },
  { href: "/docs/kickoff", label: "Kickoff" },
  { href: "/docs/tokens", label: "Tokens" },
];

/**
 * `plate` is the landing page's header: bare type over the page, no capsule, no filled
 * button, so the page's first impression is its headline rather than chrome. `solid`
 * sticks to the top of a docs page. Same links and labels in both, so the wordmark and
 * the nav don't move between them.
 */
function SiteHeader({ variant }: { variant: "plate" | "solid" }) {
  const plate = variant === "plate";

  if (plate) {
    return (
      <header className="relative z-30">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-10 px-4 py-6 sm:px-6">
          <Link href="/" className={cn("type-display shrink-0 rounded-sm text-lg text-foreground", FOCUS_RING)}>
            groundwork
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground", FOCUS_RING)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex shrink-0 items-center gap-6">
            <ThemeToggle />
            <Link
              href="/docs"
              className={cn("rounded-sm text-sm font-medium text-foreground underline-offset-4 hover:underline", FOCUS_RING)}
            >
              Browse the docs
            </Link>
          </div>
        </div>
      </header>
    );
  }

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
