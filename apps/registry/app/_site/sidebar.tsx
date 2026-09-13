"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type SidebarSection = { title: string; items: { href: string; label: string }[] };

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
                  "-ms-2 block rounded-sm border-s px-2 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
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

export function Sidebar({ sections }: { sections: SidebarSection[] }) {
  const pathname = usePathname();
  return (
    <>
      {/* Wide: a column that stays put while the page scrolls. */}
      <nav
        aria-label="Documentation"
        className="scroll-slim sticky top-20 hidden max-h-[calc(100svh-6rem)] overflow-y-auto pb-10 lg:block"
      >
        <Links sections={sections} pathname={pathname} />
      </nav>

      {/* Narrow: the same list, folded away until asked for. No JS, so it works before hydration. */}
      <details className="rounded-md border border-border bg-card lg:hidden">
        <summary className="cursor-pointer rounded-md px-4 py-3 text-sm text-card-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          Browse the docs
        </summary>
        <div className="border-t border-border px-4 pt-4 pb-4">
          <Links sections={sections} pathname={pathname} />
        </div>
      </details>
    </>
  );
}
