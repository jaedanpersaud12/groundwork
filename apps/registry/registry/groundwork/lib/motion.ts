// Shared motion vocabulary. Anything that slides a thumb or rolls content in from
// the direction of travel uses these, so tuning one tunes all of them.
// Source: flvs → jobpilot components/interior/motion.ts.

/** A thumb or highlight sliding between slots. Firm, barely any overshoot. */
export const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;

export const EASE = [0.23, 1, 0.32, 1] as const;

/** Content arriving from the direction of travel. Short enough to feel instant. */
export const ROLL = { duration: 0.18, ease: EASE } as const;

/** A small indicator turning or scaling in place (sort arrows). */
export const TURN = { type: "spring", stiffness: 500, damping: 32 } as const;

/** What every one of the above becomes under `prefers-reduced-motion`. */
export const STILL = { duration: 0 } as const;
