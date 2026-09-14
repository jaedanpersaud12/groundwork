"use client";

// Source: interior.dev Sortable Table, on table-card's Th. The header affordance only:
// a clickable column head whose arrow turns with the direction. Sorting itself is
// the caller's job (useDataTable, or the server).

import type { MouseEvent, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUp } from "lucide-react";

import { STILL, TURN } from "@/registry/groundwork/lib/motion";
import { Th } from "@/registry/groundwork/ui/table-card";
import { cn } from "@/lib/utils";

type SortableTableHeadProps = {
  /** The direction this column is sorted in, or null when it is not the sorted column. */
  direction: "asc" | "desc" | null;
  onSort: () => void;
  /** Make the head a real link (URL-driven sorting). A plain click still calls `onSort`. */
  href?: string;
  align?: "start" | "end";
  className?: string;
  children: ReactNode;
};

function SortableTableHead({ direction, onSort, href, align = "start", className, children }: SortableTableHeadProps) {
  const reduced = useReducedMotion();
  const active = direction !== null;

  const inner = (
    <>
      <span>{children}</span>
      <motion.span
        aria-hidden
        className="shrink-0"
        initial={false}
        animate={{ rotate: direction === "desc" ? 180 : 0, opacity: active ? 1 : 0.35, scale: active ? 1 : 0.8 }}
        transition={reduced ? STILL : TURN}
      >
        <ArrowUp className="size-3" />
      </motion.span>
    </>
  );

  const controlClassName = cn(
    "flex w-full items-center gap-1 px-4 py-2.5 font-medium outline-none transition-colors duration-150 ease-out hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
    align === "end" && "flex-row-reverse text-right",
    active && "text-foreground",
  );

  function handleLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onSort();
  }

  return (
    <Th
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      align={align === "end" ? "right" : "left"}
      className={cn("p-0", className)}
    >
      {href ? (
        <a href={href} onClick={handleLinkClick} className={controlClassName}>
          {inner}
        </a>
      ) : (
        <button type="button" onClick={onSort} className={controlClassName}>
          {inner}
        </button>
      )}
    </Th>
  );
}

export { SortableTableHead };
