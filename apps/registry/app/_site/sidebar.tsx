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
        <div key={section.title} className="mt-6 grid gap-1 first:mt-0">
          <p className="type-section pb-1 text-sm text-foreground">{section.title}</p>
          {section.items.map((item) => {
            const current = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "-ms-2 block rounded-sm border-s px-2 py-1 text-sm transition-colors",
                  FOCUS_RING,
                  current
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
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
        className="scroll-slim sticky top-20 hidden max-h-[calc(100svh-6rem)] self-start overflow-y-auto pb-10 lg:block"
      >
        <Links sections={sections} pathname={pathname} />
      </nav>

      {/* Narrow: the same list, folded away until asked for. No JS, so it works before hydration. */}
      <details ref={folded} className="rounded-md border border-border bg-card lg:hidden">
        <summary className={cn("cursor-pointer rounded-md px-4 py-3 text-sm text-card-foreground", FOCUS_RING)}>
          Browse the docs
        </summary>
        <nav aria-label="Documentation" onClick={foldOnNavigate} className="border-t border-border px-4 pt-4 pb-4">
          <Links sections={sections} pathname={pathname} />
        </nav>
      </details>
    </>
  );
}

export { Sidebar, type SidebarSection };
