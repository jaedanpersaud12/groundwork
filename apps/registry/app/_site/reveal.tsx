"use client";

import { useEffect, useRef } from "react";

/**
 * One fade as a section arrives. The hero settles once on load; this is the same gesture
 * applied to the sections you scroll to, and the site's only other motion.
 *
 * The hidden starting state lives in CSS, inside `@media (prefers-reduced-motion:
 * no-preference)` — not here — for one reason worth keeping: `globals.css` zeroes every
 * transition duration under `reduce`, so a JS-owned `opacity: 0` would leave anyone with
 * that preference looking at an empty page if the observer never ran. Scoping the hidden
 * state to `no-preference` means reduced motion gets the content outright, with no
 * transform and no dependency on this component at all. A `<noscript>` rule in
 * `layout.tsx` covers the other gap: motion allowed, JavaScript off.
 *
 * `rootMargin` fires the fade slightly before the section's top edge reaches the viewport,
 * so it reads as arriving rather than as catching up.
 */
function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Nothing to do when the browser can't observe: CSS has already left it visible.
    if (typeof IntersectionObserver === "undefined") {
      node.dataset.shown = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute("data-shown", "true");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="reveal" data-shown="false">
      {children}
    </div>
  );
}

export { Reveal };
