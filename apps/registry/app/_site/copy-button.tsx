"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import { FOCUS_RING } from "./styles";

type Status = "idle" | "copied" | "failed";

/** A spring for the icons' crossfade, and a quick ease for the check drawing itself. */
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const DRAW = { duration: 0.26, ease: [0.23, 1, 0.32, 1] } as const;
const STILL = { duration: 0 } as const;

/**
 * Concept adapted from interior.dev's copy button: the three icons share one cell and
 * crossfade on a spring, the check draws itself in, and the status is announced. Colours are
 * contract tokens. Reverts after two seconds. A failed write (an insecure origin, a denied
 * permission) shows a cross, because a copy button that does nothing reads as one that
 * worked.
 */
function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const reduced = useReducedMotion();
  const fade = reduced ? STILL : CROSSFADE;

  useEffect(() => {
    if (status === "idle") return;
    const id = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(id);
  }, [status]);

  const show = (state: Status) => ({ opacity: status === state ? 1 : 0, scale: status === state ? 1 : 0.9 });

  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(value).then(
          () => setStatus("copied"),
          () => setStatus("failed"),
        )
      }
      aria-label={`Copy ${label}`}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md text-subtle-foreground transition-[color,background-color,scale] duration-300 ease-fluid hover:bg-muted hover:text-foreground active:scale-[0.96]",
        status === "copied" && "text-success hover:text-success",
        status === "failed" && "text-destructive hover:text-destructive",
        FOCUS_RING,
        className,
      )}
    >
      <span aria-hidden className="grid size-3.5">
        <motion.svg
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="col-start-1 row-start-1 size-3.5"
          initial={false}
          animate={show("idle")}
          transition={fade}
        >
          <path d="M9.6 5.1V3.7A1.7 1.7 0 0 0 7.9 2H3.7A1.7 1.7 0 0 0 2 3.7v4.2a1.7 1.7 0 0 0 1.7 1.7h1.4" />
          <rect x="5.1" y="5.1" width="6.9" height="6.9" rx="1.7" />
        </motion.svg>
        <motion.svg
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="col-start-1 row-start-1 size-3.5"
          initial={false}
          animate={show("copied")}
          transition={fade}
        >
          <motion.path
            d="M2.9 7.4 5.6 10.1 11.1 4"
            initial={false}
            animate={{ pathLength: status === "copied" ? 1 : 0 }}
            transition={reduced ? STILL : DRAW}
          />
        </motion.svg>
        <motion.svg
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          className="col-start-1 row-start-1 size-3.5"
          initial={false}
          animate={show("failed")}
          transition={fade}
        >
          <path d="M3.6 3.6 10.4 10.4" />
          <path d="M10.4 3.6 3.6 10.4" />
        </motion.svg>
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? `${label} copied` : status === "failed" ? `Couldn't copy ${label}` : ""}
      </span>
    </button>
  );
}

export { CopyButton };
