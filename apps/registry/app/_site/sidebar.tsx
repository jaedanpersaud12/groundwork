"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import { cn } from "@/lib/utils";

import { FOCUS_RING } from "./styles";

type SidebarSection = { title: string; items: { href: string; label: string }[] };

function Links({ sections, pathname }: { sections: SidebarSection[]; pathname: string }) {
  return (
    <>
      {sections.map((section) => (
        <div key={section.title} className="mt-8 grid gap-0.5 first:mt-0">
          <p className="px-3 pb-2 text-xs font-semibold text-foreground">{section.title}</p>
          {section.items.map((item) => {
            const current = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors duration-300 ease-fluid",
                  FOCUS_RING,
                  current
                    ? "bg-card font-medium text-card-foreground shadow-border"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

function Sidebar({ sections }: { sections: SidebarSection[] }) {
  const pathname = usePathname();
  const folded = useRef<HTMLDetailsElement>(null);

  /*
   * The docs layout persists across navigations, so the folded list would stay open after a
   * link in it is tapped. It closes on the click itself rather than on the pathname change:
   * by the time the pathname changes, Next has already scrolled to where the page started
   * under the open list, and collapsing it then leaves the reader thirty links down the page.
   */
  function foldOnNavigate(event: React.MouseEvent) {
    if (folded.current && (event.target as HTMLElement).closest("a")) folded.current.open = false;
  }

  return (
    <>
      {/* Wide: a column that stays put while the page scrolls. */}
      <nav
        aria-label="Documentation"
        className="scroll-slim sticky top-24 hidden max-h-[calc(100svh-7rem)] self-start overflow-y-auto pb-12 lg:block"
      >
        <Links sections={sections} pathname={pathname} />
      </nav>

      {/* Narrow: the same list, folded away until asked for. No JS, so it works before hydration. */}
      <details ref={folded} className="rounded-xl bg-card shadow-border lg:hidden">
        <summary className={cn("cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-card-foreground", FOCUS_RING)}>
          Browse the docs
        </summary>
        <nav aria-label="Documentation" onClick={foldOnNavigate} className="border-t border-border px-1 py-4">
          <Links sections={sections} pathname={pathname} />
        </nav>
      </details>
    </>
  );
}

export { Sidebar, type SidebarSection };
