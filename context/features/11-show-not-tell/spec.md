# 11 Show, don't tell — the landing page and the setup docs

## What

The landing page's "Two halves" section and `/docs`'s "Set up a project" section describe
groundwork in prose. This replaces the description with the artefact: frontmatter read off
a real `skills/*/SKILL.md`, the verbatim `no-raw-colors` message a developer actually sees
in their editor, and the setup commands with the connective prose cut back to what is
load-bearing. Below-the-fold sections gain one scroll-entry fade, matching the hero's
single deliberate motion moment rather than adding a second motion language.

Nothing about the brand changes: same palette, same typeface, same `lucide-react`, same
pill CTA, same illustrated hero.

## Why

The site's job is to make someone believe the foundation is real before they run a command.
It already does this once — the `context/` tree in "the architecture exists before the code
does" is generated from the repo at build time, so it cannot lie. The sections on either
side of it fall back to bullet lists that any project could have written, and they cost
more words to say less.

There is also a live factual error: `/docs` tells the reader the automated half (`kit init`)
does not exist yet. It has since feature 09 shipped.

## Done when

- [ ] The "Two halves" section on `/` shows repo artefacts rather than prose bullets. The
      agent-kit half renders content read from a real `skills/*/SKILL.md` at build time;
      the design-system half renders the `no-raw-colors` message string read from
      `packages/eslint-plugin/index.js`. Neither is hand-copied: changing the message in
      the plugin changes the site, and deleting the source fails the build. Checked by
      editing each source, rebuilding, and recording what happened.
- [ ] Rendered visible copy on `/` and `/docs` is shorter than before. Word counts of
      `document.body.innerText` for both routes, before and after, recorded in `log.md`.
- [ ] `/docs` no longer claims `kit init` does not exist
      (`apps/registry/app/docs/page.tsx:97-98` as of `e62791d`).
- [ ] Sections below the fold on `/` fade in once on scroll entry, driven by
      `IntersectionObserver`, and are fully visible with no residual transform under
      `prefers-reduced-motion: reduce`. Checked with emulation, reading computed styles
      rather than screenshots (see `knowledge/browser-verification.md`).
- [ ] Version numbers in the registry list use tabular figures, so the column aligns.
      Checked by reading computed `font-variant-numeric`.
- [ ] `bun run check` passes, and `bun run --filter registry typecheck` and the production
      build both pass.
- [ ] `/` and `/docs` have no horizontal overflow at 400px in both themes, measured as
      `documentElement.scrollWidth <= 400` in a 400px iframe, not by screenshot.
- [ ] The diff touches no file under `packages/tokens/`, adds no runtime dependency, and
      introduces no new font, icon library or colour.

## Out of scope

- Palette, typeface, icon-library, border-radius or spacing-scale changes. The vendored
  `minimalist-ui` and `redesign-existing-projects` skills prescribe several; groundwork has
  its own contract and they do not apply. Taking their layout and density reasoning only.
- Any animation library. The one fade uses `IntersectionObserver` and a CSS transition.
- Docs pages other than `/docs` itself.
- The hero illustration and its four measured overlay plates.
- The registry item components themselves — this is the preview site (`app/**`) only.
