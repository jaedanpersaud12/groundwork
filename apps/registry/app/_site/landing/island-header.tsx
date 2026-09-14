"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/groundwork/ui/button";

import { NAV } from "../nav";
import { Mark } from "../mark";
import { FOCUS_RING } from "../styles";
import { ThemeToggle } from "../theme-toggle";

/** How far the page scrolls before the bar gathers itself into a panel. */
const THRESHOLD = 24;

/**
 * The landing page's navigation. At the top of the page it is an open row lined up with
 * the content below it; once the page scrolls it narrows into a floating card. Both states
 * are the same height, so the swap never nudges the page.
 *
 * Small screens get no menu. The links are a shortcut to three places the page and its
 * button already reach, so below `md` the header is the wordmark and the button.
 */
function IslandHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > THRESHOLD);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    // At the top of the page the bar floats over the hero's night sky, which is dark in both
    // themes, so it takes the dark tokens there and the reader's theme once it becomes a card.
    <header className={cn("sticky top-0 z-40 flex justify-center", !scrolled && "dark")}>
      <div
        data-scrolled={scrolled || undefined}
        className={cn(
          "flex w-full max-w-6xl items-center justify-between gap-4 rounded-none bg-card/0 px-4 py-3.5 backdrop-blur-none sm:px-6",
          "transition-[max-width,width,margin,padding,border-radius,background-color,box-shadow] duration-500 ease-fluid",
          "data-scrolled:mt-3 data-scrolled:w-[calc(100%-1.5rem)] data-scrolled:max-w-3xl data-scrolled:rounded-2xl data-scrolled:bg-card/90 data-scrolled:py-2 data-scrolled:ps-4 data-scrolled:pe-2 data-scrolled:shadow-border data-scrolled:backdrop-blur-xl",
        )}
      >
        <Link
          href="/"
          className={cn("flex shrink-0 items-center gap-2 rounded-sm type-section text-base text-foreground", FOCUS_RING)}
        >
          <Mark className="h-[1.15em] w-auto" />
          groundwork
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Sections" className="hidden items-center gap-0.5 rounded-lg bg-muted p-0.5 md:flex">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-300 ease-fluid hover:bg-background hover:text-foreground",
                  FOCUS_RING,
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle className="rounded-lg" />
          <Button nativeButton={false} render={<Link href="/docs" />}>
            Read the docs
          </Button>
        </div>
      </div>
    </header>
  );
}

export { IslandHeader };
