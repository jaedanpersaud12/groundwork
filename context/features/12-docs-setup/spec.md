# 12 Docs refresh, starting with setup

## What

The docs shell (header, sidebar, page and section components) is rebuilt to the same
standard as the redesigned landing page, and `/docs` becomes a real setup guide: choose the
whole kit or only the design system, then follow numbered steps, each with its command and
what it writes. The whole-kit path is `create-next-app`, `kit init`, the kickoff prompts, the
checks, and the first feature, in the order feature 09 proved end to end.

## Why

`/docs` is where a person who liked the landing page goes next, and it currently opens with
a wall of prose, sets up the design system only, and says `kit init` does not exist.

## Done when

- [ ] `/docs` documents both paths with every command in run order, and the whole-kit path
      includes `kit init`, the kickoff prompts, `kit doctor`/`kit check` and `/feature start`.
- [ ] Every command, file name and count on the page is either read from source or matches
      the kit's own CLI usage text and init.ts; nothing is invented.
- [ ] The design-system-only path names the two things `shadcn init` leaves undone that
      `kit init` does (leftover create-next-app CSS, the lint plugin not wired), with the real
      eslint config lines.
- [ ] No page under `/docs` still says `kit init` is unbuilt.
- [ ] The docs shell: no duplicated nav in the header, no single-sided borders, sections
      grouped by space, and every docs route renders with no console errors.
- [ ] No horizontal overflow on `/docs` from 320px to 1920px, in both themes.
- [ ] `bun run check`, typecheck and build pass.

## Out of scope

- Publishing `@ja3dan/kit` to npm (the commands assume it; not published yet).
