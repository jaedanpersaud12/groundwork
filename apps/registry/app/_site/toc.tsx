"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type TocEntry = { id: string; label: string };

/**
 * Marks the section currently in view. The observer window is the top third of the
 * viewport, so a heading counts as "reached" once it is comfortably on screen rather
 * than the instant its first pixel appears.
 */
export function Toc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id);

  useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records.filter((record) => record.isIntersecting);
        if (visible.length) {
          setActive(visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0].target.id);
        }
      },
      { rootMargin: "-88px 0px -66% 0px" },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav aria-label="On this page" className="sticky top-20 hidden xl:block">
      <p className="pb-2 text-sm text-subtle-foreground">On this page</p>
      <ul className="grid gap-1">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={active === entry.id ? "location" : undefined}
              className={cn(
                "block rounded-sm py-0.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active === entry.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
