"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Segmented control for swapping one view of the same data for another. Source: flvs.
 *
 * The track's padding plus its border is the inset on every side, and each segment's
 * radius is the track's less that inset, so the selected fill's corners run concentric
 * with the track's instead of pinching at the ends.
 */
function ViewToggle<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string; icon?: React.ReactNode }[];
  /** Accessible name for the group, e.g. "Row density". */
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="view-toggle"
      className={cn("inline-flex h-8 items-stretch rounded-lg border border-border p-[3px]", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[calc(var(--radius-lg)-4px)] px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset [&_svg]:size-3.5",
            value === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export { ViewToggle };
