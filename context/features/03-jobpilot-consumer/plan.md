# Plan — 03 jobpilot becomes the first consumer

## What we're building

jobpilot (`~/Projects/jobpilot`, a separate git repo) gets a real `@ja3dan` registry entry
in its `components.json`, adopts `@ja3dan/tokens`' generated CSS for its base (shadcn-style)
tokens via the already-prepared `themes/jobpilot.css`, and has its 8 hand-copied UI
components (`button`, `calendar`, `checkbox`, `input`, `label`, `popover`, `table`,
`textarea`) replaced by kit-installed ones. It ends the feature with a `kit.lock.json`
written by the real `packages/kit` CLI — the first time any of `kit lock` / `sync status` /
`sync update` / `link` has run against a real project instead of 04's throwaway fixture.

## Decisions

- **jobpilot adopts the contract's base tokens, not just the registry URL.** The 8
  components use `subtle-foreground` and jobpilot's `globals.css` doesn't define it (nor
  `destructive-subtle` / `success-subtle` / `warning-subtle` / `info-subtle`) — installing
  as-is would ship calendar/input/table/textarea text with no color. `packages/tokens/themes/jobpilot.css`
  already exists for exactly this: its header says light values were taken from jobpilot's
  own `globals.css` "so migrating it onto the registry changes nothing visually," with two
  documented contrast fixes. Verified the radius scale matches too — jobpilot's hardcoded
  `--radius-sm/md/lg/xl` (4/8/12/16px) equal the contract's `--radius * 0.5/1/1.5/2` at
  jobpilot's `--radius: 0.5rem`. jobpilot's *other* tokens (`--surface-*`, `--text-*`,
  `--hero-*`, documented in its 426-line `ui-tokens.md`) are untouched — that migration is
  06's, not 03's.
- **`components.json` gets hand-edited, not re-`init`'d.** jobpilot's config
  (`style: base-nova`, `iconLibrary: lucide`, `baseColor: neutral`, `cssVariables: true`)
  already matches what `shadcn init <url>/r/setup.json` would set — re-running `init` risks
  overwriting settings that already happen to be correct, and `knowledge/shadcn-registry.md`
  says `init` is for new projects; existing ones need the old token blocks removed by hand.
  Add `"registries": {"@ja3dan": "https://gw.jaedan.me/r/{name}.json"}` directly.
- **`kit` runs unpublished, via `--cwd`.** `@ja3dan/kit` isn't on npm (`@ja3dan/tokens` is,
  at 0.1.0; `npm view @ja3dan/kit` 404s). Publishing an unproven tool before it's been run
  against a real project is backwards, and publishing is a public, hard-to-reverse action
  worth its own conversation regardless. Build it once in groundwork
  (`bun run --filter kit build`) and invoke `node packages/kit/dist/kit.js <cmd> --cwd
  ~/Projects/jobpilot` from groundwork's own repo. jobpilot's `package.json` never gets a
  kit dependency.
- **New branch in jobpilot, not on top of its find-jobs WIP.** jobpilot is a test repo, so
  the uncommitted `feat/09-find-jobs-ui` work carrying onto the new branch is an accepted
  cost, not something to coordinate around.
- **Deployed registry only** (`gw.jaedan.me`), not `kit link`'s local dev server — this is
  meant to prove the real, published path works, not the local-dev loop `link` exists for.

## Assumptions

- `bunx shadcn add @ja3dan/<item> --overwrite` can take all 8 item names in one call; if it
  can't, fall back to one invocation per item.
- Groundwork's `no-raw-colors` eslint rule and `@ja3dan/eslint-plugin` are **not** installed
  into jobpilot as part of this feature — jobpilot's own un-migrated components would fail
  it immediately, which is a 06 concern, not a criterion here.
- jobpilot has no `typecheck` script (only `dev` / `build` / `start` / `lint`). Verifying
  "typecheck is clean" means running `bunx tsc --noEmit` directly, not adding a new script
  — adding one isn't this feature's call to make in someone else's `package.json`.
- The CSS merge in `globals.css` removes exactly the tokens `@ja3dan/tokens/theme.css` +
  `themes/jobpilot.css` now own (the 30 required + `chart-*`/`sidebar-*` contract tokens,
  and their `@theme inline` `--color-*` mappings) and leaves everything else — fonts,
  shadow primitives, tracking, jobpilot's own surface/text/hero tokens, the two `@utility`
  blocks — untouched. Confirming nothing was missed either way is a job for the before/after
  screenshots, not a line-count check.
- jobpilot's own `.dark` values were never real dark mode (per `jobpilot.css`'s header
  comment) — screenshot comparison targets light mode only; there's no "before" to match in
  dark.

## How to build it

1. In groundwork: `bun run --filter kit build` (produces `packages/kit/dist/kit.js`).
2. In jobpilot: create a new branch for this work (off current `feat/09-find-jobs-ui` HEAD,
   WIP and all — see Decisions).
3. In jobpilot: start the dev server, screenshot homepage, profile, and find-jobs (light
   mode) as the "before" set.
4. In jobpilot: `bun add @ja3dan/tokens`.
5. In jobpilot: edit `components.json`, adding the `registries.@ja3dan` entry.
6. In jobpilot: edit `app/globals.css` — replace the contract-owned token declarations in
   `:root`/`.dark` and their `@theme inline` mappings with
   `@import "@ja3dan/tokens/theme.css"`, `@import "@ja3dan/tokens/base.css"`, and
   `@import "@ja3dan/tokens/themes/jobpilot.css"`; keep everything else in the file as is.
7. In jobpilot: `bunx shadcn add @ja3dan/button @ja3dan/calendar @ja3dan/checkbox
   @ja3dan/input @ja3dan/label @ja3dan/popover @ja3dan/table @ja3dan/textarea --overwrite`.
8. From groundwork: `node packages/kit/dist/kit.js lock --cwd ~/Projects/jobpilot`; confirm
   `kit.lock.json` lists all 8 items with `version`/`computedHash`/`track`.
9. In jobpilot: screenshot the same three pages again; diff against the "before" set.
10. In jobpilot: `bun run lint` and `bunx tsc --noEmit`; fix anything the swap surfaced.
11. Record each "done when" criterion's evidence in `log.md` as it's checked.

## Out of scope

- Migrating jobpilot's non-registry component folders (`auth`, `homepage`, `interior`,
  `layout`, `profile`, `find-jobs`)
- Replacing `ui-tokens.md` / jobpilot's own surface-text-hero tokens with the contract
- `@ja3dan/eslint-plugin` in jobpilot
- Resolving the `pagination` / `sortable-table-head` naming overlap with the in-progress
  find-jobs branch
- Publishing `@ja3dan/kit` to npm
- `kit check` / `kit doctor` (05) and `/kickoff` (06)
