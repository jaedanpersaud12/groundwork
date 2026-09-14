"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * A number that counts up to itself the first time it scrolls into view. The server
 * renders the real value as plain text — nothing here can leave a reader looking at "0"
 * or a blank span if the script never arrives, only a number that skips its own approach.
 */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduced) return;

    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.32, 0.72, 0, 1],
      onUpdate(current) {
        node.textContent = String(Math.round(current));
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

export { CountUp };
