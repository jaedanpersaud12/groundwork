import Link from "next/link";

import { cn } from "@/lib/utils";

import { Mark } from "./mark";
import { FOCUS_RING } from "./styles";
import { IslandHeader } from "./landing/island-header";
import { ThemeToggle } from "./theme-toggle";


/**
 * `plate` is the landing page's header: an open row that gathers into a card on scroll (see island-header.tsx).
 * `solid` is the docs bar: the wordmark and where you are. The docs sidebar carries the
 * navigation, so the bar doesn't repeat it.
 */
function SiteHeader({ variant }: { variant: "plate" | "solid" }) {
  const plate = variant === "plate";

  if (plate) return <IslandHeader />;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className={cn("flex items-center gap-2 rounded-sm type-section text-base text-foreground", FOCUS_RING)}
        >
          <Mark className="h-[1.15em] w-auto" />
          groundwork
        </Link>
        <span aria-hidden className="text-subtle-foreground">
          /
        </span>
        <Link
          href="/docs"
          className={cn("rounded-sm text-sm text-muted-foreground transition-colors duration-300 ease-fluid hover:text-foreground", FOCUS_RING)}
        >
          Docs
        </Link>
        <div className="ms-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export { SiteHeader };
