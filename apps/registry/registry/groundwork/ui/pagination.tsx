"use client";

// Source: interior.dev Pagination → flvs → jobpilot. Fixed slot widths so the arrows
// never move under the cursor, one sliding thumb, numbers that roll in from the
// direction of travel, and a delayed page announcement for screen readers.

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { CELL, ROLL, STILL } from "@/registry/groundwork/lib/motion";
import { cn } from "@/lib/utils";

const slotFor = (digits: number) => Math.max(32, 16 + digits * 8);
const GAP = 4;
const ANNOUNCE_DELAY_MS = 500;

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

type PaginationItem = number | "gap-l" | "gap-r";

/** Which page numbers to show, given where the window sits. */
function paginate(page: number, count: number, siblings: number, boundaries: number): PaginationItem[] {
  const total = 2 * boundaries + 2 * siblings + 3;
  if (count <= total) return range(1, count);

  const nearStart = page < boundaries + siblings + 2;
  const nearEnd = page > count - boundaries - siblings - 1;

  if (nearStart) {
    return [...range(1, 2 * siblings + boundaries + 2), "gap-r", ...range(count - boundaries + 1, count)];
  }
  if (nearEnd) {
    return [...range(1, boundaries), "gap-l", ...range(count - 2 * siblings - boundaries - 1, count)];
  }
  return [
    ...range(1, boundaries),
    "gap-l",
    ...range(page - siblings, page + siblings),
    "gap-r",
    ...range(count - boundaries + 1, count),
  ];
}

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

type PaginationProps = {
  /** Total pages, at least 1. */
  count: number;
  /** Current page, 1-based. */
  page: number;
  onPageChange: (page: number) => void;
  /**
   * Give every page a real URL (open in new tab, works before hydration). A plain
   * click still goes to `onPageChange`, so the caller owns navigation. Omit for buttons.
   */
  hrefFor?: (page: number) => string;
  /** Pages shown either side of the current one. Default 1. */
  siblings?: number;
  /** Pages always shown at each end. Default 1. */
  boundaries?: number;
  label?: string;
  className?: string;
};

const STEP =
  "flex size-8 shrink-0 items-center justify-center rounded-md outline-none transition-colors duration-150 ease-out focus-visible:ring-1 focus-visible:ring-ring";
const STEP_ENABLED = "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

function Chevron({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden focusable="false" className={flip ? "-scale-x-100" : undefined}>
      <path d="M4.75 2.75 8 6l-3.25 3.25" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type PageTargetProps = {
  href?: string;
  onGo: () => void;
  className: string;
  children: ReactNode;
  "aria-label": string;
  "aria-current"?: "page";
};

/** A real link when there is a URL (plain clicks still go through `onGo`), otherwise a button. */
function PageTarget({ href, onGo, className, children, ...aria }: PageTargetProps) {
  if (href) {
    return (
      <a
        href={href}
        className={className}
        onClick={(event) => {
          if (!isPlainClick(event)) return;
          event.preventDefault();
          onGo();
        }}
        {...aria}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={onGo} {...aria}>
      {children}
    </button>
  );
}

function Pagination({
  count,
  page,
  onPageChange,
  hrefFor,
  siblings = 1,
  boundaries = 1,
  label = "Pagination",
  className,
}: PaginationProps) {
  const reduced = useReducedMotion();
  const pageCount = Math.max(1, count);
  const current = Math.min(Math.max(1, page), pageCount);
  const items = paginate(current, pageCount, siblings, boundaries);
  const thumbIndex = items.indexOf(current);
  const slot = slotFor(String(pageCount).length);

  // Which way numbers roll in from, so a jump from 2 to 7 still reads forwards.
  const [seen, setSeen] = useState({ page: current, direction: 1 });
  if (seen.page !== current) {
    setSeen({ page: current, direction: current > seen.page ? 1 : -1 });
  }

  // Announced late on purpose: clicking through four pages says where you landed.
  const [spoken, setSpoken] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSpoken(`Page ${current} of ${pageCount}`), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [current, pageCount]);

  function go(to: number) {
    if (to !== current) onPageChange(to);
  }

  return (
    <nav aria-label={label} data-slot="pagination" className={cn("inline-block", className)}>
      <div className="flex items-center" style={{ gap: GAP }}>
        {current > 1 ? (
          <PageTarget href={hrefFor?.(current - 1)} onGo={() => go(current - 1)} aria-label="Previous page" className={cn(STEP, STEP_ENABLED)}>
            <Chevron flip />
          </PageTarget>
        ) : (
          <span aria-hidden className={cn(STEP, "text-subtle-foreground opacity-50")}>
            <Chevron flip />
          </span>
        )}

        <div className="relative">
          {/* Slot geometry is computed, so width and offset are inline. */}
          <motion.span
            aria-hidden
            initial={false}
            animate={{ x: thumbIndex * (slot + GAP) }}
            transition={reduced ? STILL : CELL}
            style={{ width: slot }}
            className="absolute inset-y-0 left-0 rounded-md bg-primary/10"
          />
          <ol className="relative flex" style={{ gap: GAP }}>
            {items.map((item) => {
              if (typeof item !== "number") {
                return (
                  <li
                    key={item}
                    aria-hidden
                    style={{ width: slot }}
                    className="flex h-8 items-center justify-center text-xs text-subtle-foreground"
                  >
                    &hellip;
                  </li>
                );
              }
              const selected = item === current;
              return (
                <li key={`slot-${item}`} style={{ width: slot }}>
                  <PageTarget
                    href={hrefFor?.(item)}
                    onGo={() => go(item)}
                    aria-label={`Page ${item}`}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "flex h-8 w-full items-center justify-center rounded-md text-xs font-medium tabular-nums outline-none transition-colors duration-150 ease-out focus-visible:ring-1 focus-visible:ring-ring",
                      selected ? "text-primary" : STEP_ENABLED,
                    )}
                  >
                    <motion.span
                      key={item}
                      initial={reduced ? false : { opacity: 0, x: 8 * seen.direction }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={reduced ? STILL : ROLL}
                    >
                      {item}
                    </motion.span>
                  </PageTarget>
                </li>
              );
            })}
          </ol>
        </div>

        {current < pageCount ? (
          <PageTarget href={hrefFor?.(current + 1)} onGo={() => go(current + 1)} aria-label="Next page" className={cn(STEP, STEP_ENABLED)}>
            <Chevron />
          </PageTarget>
        ) : (
          <span aria-hidden className={cn(STEP, "text-subtle-foreground opacity-50")}>
            <Chevron />
          </span>
        )}
      </div>
      <span role="status" className="sr-only">
        {spoken}
      </span>
    </nav>
  );
}

type PaginationSummaryProps = { from: number; to: number; total: number; noun?: string; className?: string };

/** "Showing 1 to 10 of 42 results". */
function PaginationSummary({ from, to, total, noun = "results", className }: PaginationSummaryProps) {
  return (
    <p className={cn("text-sm text-muted-foreground tabular-nums", className)}>
      Showing <span className="text-foreground">{from}</span> to <span className="text-foreground">{to}</span> of{" "}
      <span className="text-foreground">{total}</span> {noun}
    </p>
  );
}

export { Pagination, PaginationSummary };
