# 11 Show, don't tell — the landing page

## What

The landing page's "Two halves" section describes groundwork in prose bullets. This
replaces the description with the artefact: frontmatter read off a real `skills/*/SKILL.md`
at build time, and the verbatim `no-raw-colors` message a developer actually sees, read
from the plugin's own rule metadata. Sections below the fold gain one scroll-entry fade,
matching the hero's single deliberate motion moment rather than adding a second motion
language.

Nothing about the brand changes: same palette, same typeface, same `lucide-react`, same
pill CTA, same illustrated hero.

## Why

The page's job is to make someone believe the foundation is real before they run a command.
It already does this once — the `context/` tree is generated from the repo at build time,
so it cannot lie. The section above it falls back to bullet lists that any project could
have written, and they cost more words to say less. "Fails the build on a hex, an arbitrary
colour or a palette class" is a claim; the actual error text is proof.

## Done when

- [ ] The "Two halves" section on `/` shows repo artefacts rather than prose bullets. The
      agent-kit half renders frontmatter read from a real `skills/*/SKILL.md`; the
      design-system half renders the `no-raw-colors` message read from the plugin's own
      `meta.messages`, not a copy of it. Checked by changing each source, rebuilding, and
      recording that the page changed with it.
- [ ] Rendered visible copy on `/` is shorter than before. Word count of the served HTML
      before (930) and after, by the same script, recorded in `log.md`.
- [ ] Sections below the fold on `/` fade in once on scroll entry, driven by
      `IntersectionObserver`. Under `prefers-reduced-motion: reduce` they are fully visible
      with no residual transform, and with JavaScript disabled they are fully visible.
      Checked by reading computed styles under emulation, not screenshots
      (see `knowledge/browser-verification.md`).
- [ ] Version numbers in the registry list use tabular figures, so the column aligns.
      Checked by reading computed `font-variant-numeric`.
- [ ] `bun run check` passes, and `bun run --filter registry typecheck` and the production
      build both pass.
- [ ] `/` has no horizontal overflow at 400px in both themes, measured as
      `documentElement.scrollWidth <= 400` in a 400px iframe, not by screenshot.
- [ ] The diff touches no file under `packages/tokens/`, adds no runtime dependency, and
      introduces no new font, icon library or colour.

## Out of scope

- **`/docs` and every other docs page — a separate pass, by the developer's call.** Two
  things found during this feature's audit belong to it and must not be lost:
  `apps/registry/app/docs/page.tsx:97-98` states the automated half (`kit init`) does not
  exist, which has been false since 09 merged; and `/docs` renders the same `HALVES` data,
  so whichever treatment it gets should be decided against this page's result.
- Palette, typeface, icon-library, border-radius or spacing-scale changes. The vendored
  `minimalist-ui` and `redesign-existing-projects` skills prescribe several; groundwork has
  its own contract and they do not apply. Taking their layout and density reasoning only.
- Any animation library. The one fade uses `IntersectionObserver` and a CSS transition.
  `motion` is already a dependency but is the registry components' idiom, not the site's.
- The hero illustration and its four measured overlay plates.
- The registry item components themselves — this is the preview site (`app/**`) only.
