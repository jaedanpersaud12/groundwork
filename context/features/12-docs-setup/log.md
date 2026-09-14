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

## The rest of the docs

Developer asked to continue past setup. Every docs page now uses the shared building blocks
and code-surface spec; each page's claims are read from the repo or kept from the old page.

- **The loop**: the feature folder as a tree (files and the step that writes each, parsed
  from `context/features/README.md`), the five steps as numbered steps with each skill's own
  description and command, the four out-of-band skills as cards, the rule with teeth as a note.
- **Context**: groundwork's own `context/` and a new project's, behind the registry's
  `view-toggle`; the criteria example as a fails/passes pair.
- **Knowledge**: the file table is the registry's own `table-card` (stack as status pills);
  the format section shows a real file's frontmatter and its whole first gotcha (the reader
  first took only the bullet's first line, which cut the eslint.md gotcha mid-sentence; now it
  follows continuation lines).
- **Kickoff**: the three prompts as steps titled from their own `# Stage N` headings, each with
  the file it writes and its full source; the template as a tree. An invented rationale
  ("a person reading each answer is the point") was removed; the note now says only what the
  old page said.
- **Token contract**: every token with a live swatch reading `var(--token)`, so it follows the
  theme toggle; the rules as one list; `bun run tokens` as the regenerate command.
- **Component pages**: related items as chips, packages as inline code, preview frames on
  the shared surface.

Site-written copy with em dashes rewritten (kit.ts notes, page leads); text quoted from repo
files (two skill descriptions, prompt sources) left verbatim.

Also: tree rows now truncate the note before the name; markdown sources wrap and drop line
numbers; highlighted lines render as blocks with a hanging indent so a wrapped line lines up
under its text. Removed dead code: `HALVES`, the old prose `Tree`, `LintFailure`.

Evidence: all docs routes (8 routes, 44 width and theme combinations) with no page overflow and
no console errors; every TOC entry has its heading; 33/33 anchors; `bun run check` and
`build` exit 0. Token spans flagged inside code blocks were checked individually: they
overflow their line inside a block that scrolls (by design) or are a trailing space at a wrap
point, so the probe now skips content inside `pre`.

## @ja3dan/kit published, and a docs claim it corrected

Published `@ja3dan/kit@0.1.0` on the developer's instruction ("push kit"). Before publishing:
npm auth live; local `@ja3dan/tokens` and `@ja3dan/eslint-plugin` byte-identical to their
published 0.1.0 (compared file by file against the npm tarballs); `gw.jaedan.me/r/setup.json`
200; no kit, skills or templates changes on this branch versus `main`. `bun pm pack` showed
`workspace:*` rewritten to `0.1.0` and all 7 skills and the preset bundled beside `dist/kit.js`.

End to end from the packed tarball, outside the monorepo: `create-next-app@latest` with the
docs' flags, the tarball installed in a separate folder, then `kit init next16-insforge`:
6 context files, 7 skills, `globals.css` cleaned to exactly the five imports plus the font
block, the lint rule wired, the check script added; `kit doctor` exit 0 (15 checks),
`kit check` exit 0. Published with `bun publish`; npm's metadata shows `latest` 0.1.0 with the
same shasum as the tested tarball (`cfa14306…`).

The run proved the setup guide wrong in one place: it said all three checks pass before the
first feature, but `bun run check` fails on create-next-app's default page (20 raw palette
colour errors), exactly as feature 09 recorded. Step 4 now says so.
