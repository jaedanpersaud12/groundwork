"use client";

import { useEffect, useRef } from "react";

/**
 * The page's one large statement, apart from the hero. Each line is a deliberate break, and
 * each word lights from muted to full colour as it crosses a line 60% of the way down the
 * viewport, in reading order.
 *
 * Words are observed one by one. When several cross together (a whole line on a tall
 * screen), they are staggered by their order so the line fills left to right rather than
 * flipping as a block. `data-lit` is set on the DOM only, never rendered by React, so a
 * re-render can't take a lit word back to muted.
 *
 * The muted colour lives in CSS under `no-preference` with the same failsafe and
 * <noscript> escape as `.reveal`, so this can't leave the statement unreadable.
 */
function Tagline({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const words = [...(ref.current?.querySelectorAll<HTMLElement>("[data-word]") ?? [])];
    if (!words.length) return;

    if (typeof IntersectionObserver === "undefined") {
      const now = setTimeout(() => words.forEach((word) => word.setAttribute("data-lit", "")), 0);
      return () => clearTimeout(now);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => words.indexOf(a.target as HTMLElement) - words.indexOf(b.target as HTMLElement))
          .forEach((entry, order) => {
            const word = entry.target as HTMLElement;
            word.style.transitionDelay = `${order * 70}ms`;
            word.setAttribute("data-lit", "");
            observer.unobserve(word);
          });
      },
      { rootMargin: "0px 0px -40% 0px" },
    );

    words.forEach((word) => observer.observe(word));
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={ref} className="tagline max-w-[680px] type-display text-4xl text-foreground sm:text-5xl lg:text-6xl">
      {lines.map((line, lineIndex) => (
        <span key={line} className="block">
          {line.split(" ").map((word, wordIndex) => (
            <span key={`${lineIndex}-${wordIndex}`}>
              <span data-word>{word}</span>
              {wordIndex < line.split(" ").length - 1 ? " " : null}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}

export { Tagline };
