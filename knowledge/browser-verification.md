---
scope: stack
stack: [claude-code-desktop]
verified_version: Claude Code 2.1.266, Browser pane Chrome 152.0.7977.76
verified_on: 2026-09-13
---

# Verifying UI in the Claude Code Browser pane

- **The pane can stop rendering without saying so, and then scroll- and motion-dependent checks lie.** In one session, with the same "pane is currently hidden" status and `document.visibilityState === "hidden"` both times: once `requestAnimationFrame` never fired, `window.scrollTo` fired no `scroll` event, CSS transitions froze at their start value (screenshots showed last theme's button colours) and a `next/image` hero painted blank until `img.decode()`; later, all four worked. Neither `tabs_context` nor `visibilityState` tells the two states apart. Before trusting a TOC, scroll-spy, animation or screenshot check, probe first: `await Promise.race([new Promise(r => requestAnimationFrame(() => r(true))), new Promise(r => setTimeout(() => r(false), 1000))])`. If it returns `false`, read computed styles instead of screenshots, and dispatch `scroll` by hand after `scrollTo` — and say in the evidence that event delivery was simulated.
- **`resize_window` gets below the pane's own minimum width.** Dragging the pane wouldn't go under 1470px, and a narrow-width criterion was once closed on a static argument because of it. `resize_window` with `width: 400` emulates the viewport regardless (and `colorScheme` emulates `prefers-color-scheme`, which is how to test a stored theme against the opposite system default). Reset with `preset: "desktop"`.
- **A static audit of grid tracks misses nested implicit tracks; measure instead.** "Every fixed track is behind a breakpoint, every flexible one is `minmax(0,1fr)`" was true and the page still overflowed at 400px — twice — from a `grid` inside a grid item with no `grid-cols-*`, and a centred preview panel with no overflow of its own. Load every route in a 400px iframe and read `document.documentElement.scrollWidth`; anything over 400 is the check failing, and the iframe's `contentDocument` lets you walk up from the widest element to the track that grew.
