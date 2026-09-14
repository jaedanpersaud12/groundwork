"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { FOCUS_RING } from "./styles";

type TocEntry = { id: string; label: string };

/**
 * Below the sticky header, plus a little air: a heading counts as reached once it has
 * cleared the header rather than the instant it touches the top of the viewport.
 */
const REACHED_AT = 112;

/**
 * Marks the section currently being read: the last heading above a reading line. Computed
 * from positions on scroll rather than from intersection events, because an observer only
 * fires when a heading crosses its band — scroll back up into the middle of an earlier
 * section and no heading crosses anything, so the mark would stay on the later one.
 *
 * The line sits at `REACHED_AT` until the last screenful of scroll, then slides down to the
 * bottom of the viewport as the page runs out. Sections that all fit in the final screen
 * can never scroll up to a fixed line, so without the slide the mark would jump from the
 * section before them straight to the last one and skip everything in between.
 */
function Toc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id);

  useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const remaining = Math.max(0, document.documentElement.scrollHeight - viewport - window.scrollY);
      const line = remaining >= viewport ? REACHED_AT : REACHED_AT + (viewport - REACHED_AT) * (1 - remaining / viewport);
      const reached = headings.filter((heading) => heading.getBoundingClientRect().top <= line);
      setActive((reached.at(-1) ?? headings[0]).id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [entries]);

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden self-start xl:block">
      <p className="pb-3 text-xs font-semibold text-foreground">On this page</p>
      <ul className="grid gap-1">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={active === entry.id ? "location" : undefined}
              className={cn(
                "block rounded-sm py-1 text-sm transition-colors duration-300 ease-fluid",
                FOCUS_RING,
                active === entry.id ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
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

export { Toc, type TocEntry };
