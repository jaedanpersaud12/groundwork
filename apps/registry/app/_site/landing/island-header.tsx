"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { NAV } from "../nav";
import { FOCUS_RING } from "../styles";
import { ThemeToggle } from "../theme-toggle";

/**
 * The landing page's navigation: a glass pill floating 24px below the top, sized to its
 * contents. On narrow screens the links move behind a menu button whose two lines turn into
 * an X, and the menu opens as a full-screen glass overlay with its links rising in one
 * after another. Every movement uses the site's one curve (`ease-fluid`).
 *
 * The overlay is a real dialog: Escape closes it, the page behind stops scrolling, focus
 * moves to the first link on open and back to the button on close, and following a link
 * closes it.
 */
function IslandHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focus = setTimeout(() => firstLink.current?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const trigger = button.current;
    return () => {
      document.body.style.overflow = previous;
      clearTimeout(focus);
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 px-4 pt-6">
      <div className="relative z-50 mx-auto flex w-max max-w-full items-center gap-6 rounded-full bg-background/70 py-2 ps-6 pe-2 shadow-border backdrop-blur-xl">
        <Link href="/" className={cn("shrink-0 rounded-sm type-section text-base text-foreground", FOCUS_RING)}>
          groundwork
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-sm text-sm text-muted-foreground transition-colors duration-300 ease-fluid hover:text-foreground",
                FOCUS_RING,
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/docs"
            className={cn(
              "hidden rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-[background-color,scale] duration-300 ease-fluid hover:bg-primary/90 active:scale-[0.98] sm:inline-flex",
              FOCUS_RING,
            )}
          >
            Browse the docs
          </Link>
          <button
            ref={button}
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className={cn("relative grid size-9 place-items-center rounded-full md:hidden", FOCUS_RING)}
          >
            <span
              aria-hidden
              className={cn(
                "absolute h-0.5 w-4 rounded-full bg-foreground transition-transform duration-700 ease-fluid",
                open ? "rotate-45" : "-translate-y-1",
              )}
            />
            <span
              aria-hidden
              className={cn(
                "absolute h-0.5 w-4 rounded-full bg-foreground transition-transform duration-700 ease-fluid",
                open ? "-rotate-45" : "translate-y-1",
              )}
            />
          </button>
        </div>
      </div>

      <div
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-3xl md:hidden"
      >
        <nav aria-label="Sections" className="grid content-start gap-2 px-6 pt-32">
          {[...NAV, { href: "/docs", label: "Browse the docs" }].map((link, index) => (
            <Link
              key={`${link.href}-${link.label}`}
              ref={index === 0 ? firstLink : undefined}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ animationDelay: `${100 + index * 50}ms` }}
              className={cn(
                "animate-in rounded-sm py-2 type-display text-3xl text-foreground fill-mode-both duration-700 ease-fluid fade-in slide-in-from-bottom-12",
                FOCUS_RING,
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export { IslandHeader };
