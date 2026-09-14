"use client";

import { useEffect, useRef, useState } from "react";

/** How long to wait for the observer before showing the content anyway. */
const FAILSAFE_MS = 2000;

/**
 * One fade as a section arrives. The hero settles once on load; this is the same gesture
 * applied to the sections you scroll to, and the site's only other motion.
 *
 * Three things here are deliberate, and each closes a way this could strand a reader on a
 * blank page:
 *
 * 1. The hidden starting state lives in CSS, inside `@media (prefers-reduced-motion:
 *    no-preference)` — not here. `globals.css` zeroes every transition duration under
 *    `reduce`, so a JS-owned `opacity: 0` would leave anyone with that preference looking
 *    at nothing if this never ran. Scoping it to `no-preference` means reduced motion gets
 *    the content outright, by there being no rule rather than by overriding one.
 * 2. `layout.tsx` carries a `<noscript>` rule for motion-allowed, JavaScript-off.
 * 3. The timer below covers scripting working but the observer never reporting. The state
 *    between those two — scripting enabled, bundle never arrives, so this effect never runs
 *    at all — cannot be covered from here for the obvious reason, and is handled by an
 *    inline script in `layout.tsx` that this component switches off by setting
 *    `__gwReveal` on mount.
 *
 * A reader who has scrolled past by the time a failsafe fires has already seen the fade;
 * one who has not loses an effect, not the page.
 *
 * State is React's rather than a bare `setAttribute`, so a re-render can't reset the
 * attribute after the observer has disconnected.
 */
function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Tells the inline failsafe in layout.tsx that hydration got this far, so it leaves
    // the fade alone. Set before any early return: the component is alive either way.
    (window as unknown as { __gwReveal?: boolean }).__gwReveal = true;

    const node = ref.current;
    if (!node) return;

    // Nothing to observe with: CSS has already left it visible under `reduce`, and there is
    // no reason to keep it hidden under `no-preference` either.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const failsafe = setTimeout(() => setShown(true), FAILSAFE_MS);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      // Fire slightly before the top edge arrives, so it reads as arriving rather than
      // as catching up.
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(node);
    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="reveal" data-shown={shown ? "true" : "false"}>
      {children}
    </div>
  );
}

export { Reveal };
