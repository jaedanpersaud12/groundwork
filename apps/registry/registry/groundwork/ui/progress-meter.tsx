import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * How far along something is, as filled segments rather than a bar. Source: flvs.
 *
 * A continuous bar invites reading a percentage off its length, which is false
 * precision for something that moves in steps. Segments say what is true: four
 * stages, two of them done.
 */
function ProgressMeter({
  value,
  segments = 5,
  label,
  tone = "default",
  className,
}: {
  /** 0–1. */
  value: number;
  segments?: number;
  /** Shown beside the meter. Defaults to a rounded percentage. */
  label?: React.ReactNode;
  tone?: "default" | "muted";
  className?: string;
}) {
  const clamped = Math.min(1, Math.max(0, value));
  const filled = Math.round(clamped * segments);

  return (
    <span data-slot="progress-meter" className={cn("inline-flex items-center gap-2", className)}>
      <span
        role="meter"
        aria-valuemin={0}
        aria-valuemax={segments}
        aria-valuenow={filled}
        aria-label={typeof label === "string" ? label : `${filled} of ${segments}`}
        className="flex items-center gap-0.5"
      >
        {Array.from({ length: segments }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-3.5 w-1 rounded-[1px] transition-colors",
              index < filled ? (tone === "muted" ? "bg-muted-foreground/40" : "bg-foreground") : "bg-border",
            )}
          />
        ))}
      </span>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">{label ?? `${Math.round(clamped * 100)}%`}</span>
    </span>
  );
}

export { ProgressMeter };
