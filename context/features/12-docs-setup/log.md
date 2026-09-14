# 12 — log

## Plan

Confirmed in conversation 2026-09-14: rebuild the docs shell, then turn `/docs` into the
setup guide with both paths. Branched from `feat/11-show-not-tell` (not yet merged).

## Sources for every fact on `/docs`

- **create-next-app flags** from `bunx create-next-app@16.3.5 --help`: `--yes` alone uses
  saved preferences and ESLint is not a default, so the guide passes
  `--ts --tailwind --eslint --app --use-bun --yes`. `kit init` needs `eslint.config.mjs` and
  `app/globals.css`, which those produce.
- **kit init, doctor, check, sync** descriptions read from `packages/kit/src/cli.ts` usage
  text (`kitUsage`). The eslint lines read from `init.ts` (`kitEslintWiring`). What
  `kit init` writes is the landing page's `PROJECT_TREE` filtered to step 1.
- **The run order** (create-next-app, kit init, kickoff prompts, doctor/check/check script,
  feature 01) is the sequence feature 09's log records against a real throwaway project.
- **The design-system path's two manual steps** come from `knowledge/shadcn-registry.md`:
  create-next-app's leftover CSS overrides the theme, and `shadcn init` installs the lint
  plugin without wiring it. The token-name collision note is the same file's jobpilot
  `accent` finding. The CSS imports are the setup item's own `css` keys.

## Evidence

- **Both paths documented in run order, kit init included**: `/docs` sections "The whole
  kit" (5 steps) and "Only the design system" (4 steps), plus "Keep it current".
- **No stale kit init claims**: `grep -rn "still being built|doesn't do yet|before the
  automated half" apps/registry/app/docs` returns nothing; `/docs/kickoff`'s last section is
  now "Where kit init comes in".
- **Shell**: the docs header no longer repeats the nav; the sidebar's current item is a
  raised pill (was a one-sided border, and a first pass with `bg-muted` was nearly invisible
  in light mode); sections are separated by space; the TOC marks the current section in
  the foreground colour.
- **No overflow**: `/docs` at 320, 400, 768, 1024, 1440, 1920 across both themes, and every
  other docs route at 400 and 1440: `scrollWidth === innerWidth`, no child escaping its
  parent. No console errors on any route.
- **Anchors**: all 34 `#` links across `/`, `/docs/*` resolve. Found and fixed two broken
  ones: `/docs#setup` from component pages (section renamed), and `/#primitive` etc. from the
  component breadcrumbs (tier ids dropped in feature 11's landing redesign, restored).
- **Long commands wrap** in the docs (`Command wrap`), so every flag is visible; copy still
  copies the whole command.
- `bun run check` exit 0, `build` exit 0.

## Not fixed

`@ja3dan/kit` is still not on npm, so the `bunx @ja3dan/kit` commands will not run for a
reader until it is published.

## One code-surface spec, interior.dev's tree view, syntax highlighting

Developer feedback: the command box (1px border, 6px radius) and the file tree (shadow,
16px radius) looked like two systems. Now every code surface uses `code.tsx`'s constants: the
contract's raised surface (`bg-card shadow-border`, no border), `rounded-lg` frames with
`rounded-md` inner rows 4px in (the nested-radius formula), a 40px header, 12px mono on a 24px
line, and the copy button at the trailing end of the first row. Applied to `Command`,
`CodeBlock`, `SourceBlock` (component and kickoff pages), the docs `FileTree` and
`CommandList`, `DataPlate`, and the landing page's project tree and file windows.

- **Tree view**: adapted from interior.dev's (`/r/tree-view.json`, fetched and read). Kept:
  the keyboard model (arrows, Home/End, type-ahead), spring caret, open/close height
  animation, reduced-motion handling, ARIA tree roles. Changed: every stone/hex colour to a
  contract token (they would fail `no-raw-colors`), frame and rows to the site spec, an
  optional header, a `tone` for lit/quiet rows (used by the landing page's step hover). The
  node builder lives in `tree-nodes.ts`, not the client module: a server page calling it from
  the `"use client"` file 500'd `/docs` in the first attempt.
- **Copy button**: interior.dev's concept (three icons crossfading on a spring, the check
  drawing itself, a live-region status) on contract tokens.
- **Syntax highlighting**: Shiki 4.4.3, server-side at build time (no highlighter in the
  client bundle), css-variables theme. `.syntax` in globals.css points each token variable at
  a status token, because the contract promises those read as small text on the page ground
  in both themes; the chart tokens are too faint at 12px in light. Line numbers are a CSS
  counter, so selecting code doesn't select them.
- **Wrapped commands** break between words, never inside a flag (`--yes` was splitting at its
  hyphen); a single token wider than the column (a URL at 320px) breaks inside itself rather
  than being clipped.

Evidence: all docs routes at their widths with no overflow and no console errors; landing
stress clean at the page level (the `span.line` entries flagged inside the halves' file
window are that window's deliberate crop, clipped by its `code` element); 34/34 anchors;
reveal states; `bun run check` and `build` exit 0.
