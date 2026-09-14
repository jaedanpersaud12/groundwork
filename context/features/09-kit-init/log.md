# Log — 09 `packages/kit`: `kit init`

## 2026-09-14 — plan confirmed

Architected. Two decisions settled directly with you: skills/template are bundled inside
`@ja3dan/kit`'s package (not GitHub-fetched, since groundwork's own `skills/` has no
external-dependency story the way jobpilot's real third-party skill sources did); and the
capstone criterion runs in full — a real throwaway project, `kit init`, all three 06
prompts against a genuinely small fake product, a real feature 01 implemented and merged
inside that project. Plan confirmed today; nothing in `packages/kit/src/{assets,init}.ts`
exists yet.

## 2026-09-14 — build complete: assets, init, lock, doctor

Built `src/assets.ts` (bundled skills/template resolution, two-step lookup: sibling of
`dist/kit.js` when published, monorepo root when running from source), `initProject()` in
`shadcn.ts`, the `skills` section in `lockfile.ts`, `commands/init.ts`, and `kit init`'s CLI
wiring. `kit doctor`'s `"kickoff"` bucket (real but empty since 05) now generates its
required-files list from `assets.ts`'s own `readTemplate`/`readSkills` — 5 template files
plus 6 skills, 11 checks — so it can't drift from what `kit init` actually installs.

`packages/kit/scripts/bundle-assets.ts` copies root `skills/` and `templates/` into
`dist/` before `bun build` runs, confirmed by building and inspecting `dist/`.

New unit tests in `assets.test.ts` (4 tests, against the real repo content, not a fixture —
`skills/` and `templates/next16-insforge/` are stable, checked-in content, so this is more
honest than fabricating one). Full kit suite: 62 pass (58 existing + 4 new), no regressions.

**Test strategy note**: no fixture-registry test for `init()`'s `shadcn init` integration —
the existing `testing/fixture.ts` builds already-initialized projects (`components.json`
present), and building a fake `registry:base`/`setup` item plus a bare pre-init fixture
project felt like more machinery than the one thing left to prove. The throwaway-project
run below is the real proof, the same way 03 proved itself against real jobpilot rather
than a fixture.

## 2026-09-14 — real rough edge hit and fixed: create-next-app's leftover globals.css

Running `kit init` against a genuinely fresh `create-next-app` scaffold (Next.js 16.3.5,
shadcn 4.21.0, Tailwind 4.3.3) surfaced exactly the gotcha `knowledge/shadcn-registry.md`
already named in the abstract ("create-next-app's template CSS survives init... Replace
`app/globals.css` with the setup imports") — except this time it's `kit init`'s own job to
do that, not a person's.

Confirmed the exact mechanism with `git diff` against `create-next-app`'s own initial
commit: `shadcn init` only ever prepends its 4 `@import` lines to `globals.css` and never
touches anything after them. Everything left over — a `:root { --background: #fff;
--foreground: #171717 }` block, an identical `@media (prefers-color-scheme: dark)` copy,
and a plain `body { background: var(--background); ... font-family: Arial... }` rule — now
sits *after* the contract's theme import and wins: a later declaration of the same custom
property overrides an earlier one regardless of import order, and CSS cascade layers give
any unlayered rule (this leftover `body`) priority over one inside `@layer` (the contract's
own `base.css` `body` rule) regardless of source order. Net effect: every contract color
resolves to Next's default black-on-white instead of the theme, silently.

Fixed in `init.ts`'s new `cleanTailwindCss()`, called right after `initProject()`: keep the
`@import` lines, keep any real `--font-*` mapping found in the leftover `@theme inline`
block (the contract deliberately doesn't supply a font — see `packages/tokens/base.css` —
so this one's genuinely needed, not a conflict), drop everything else. Verified by rebuilding
the throwaway project from a clean `create-next-app` scaffold twice — the resulting
`globals.css` is exactly the 5 imports plus a two-line `@theme inline` font block, byte-
checked by hand both times.

This is the kind of rough edge `plan.md` said would go back in as a change here, not a
note — it did.

## 2026-09-14 — two more rough edges, found by actually trying to run `/feature start`/`finish`

Ran a genuinely separate `claude -p` session rooted at the throwaway project (real proof
the installed `feature` skill is invocable, not just present as files — it correctly
refused to start a feature on an unclean tree with no `build-plan.md`, exactly per its own
documented logic). That session also surfaced two real gaps once it tried to actually build
and finish a feature:

- **`@ja3dan/eslint-plugin` was installed but never wired into `eslint.config.mjs`.**
  `shadcn init` adds the package as a dependency (the `setup` item's own dependency list)
  but has no way to know a fresh project's config shape, so it never edits it — meaning
  `no-raw-colors` was present in `node_modules` but not actually running. Fixed with
  `wireEslintPlugin()` in `init.ts`: matches `create-next-app`'s known default
  `eslint.config.mjs` shape (verified directly, not guessed) and inserts the plugin's
  `configs.recommended` before the `globalIgnores` call.
- **No `check` script existed.** `skills/feature/SKILL.md` — installed by this same
  command — hardcodes `bun run check` in its finish step; a fresh `create-next-app`
  project only has `dev`/`build`/`start`/`lint`. Fixed with `ensureCheckScript()`:
  adds `"check": "tsc --noEmit && eslint ."` if nothing named `check` already exists.

Verified both by rebuilding the throwaway project fresh a third time and running the new
`check` script directly: it correctly **fails** — 20 raw-color errors, all from
`create-next-app`'s own default `app/page.tsx` (`bg-zinc-50`, `dark:bg-black`, and so on).
That failure is exactly the proof the wiring works — `no-raw-colors` is now actually
enforced end to end, on real content, through a real `bun run check`. Feature 01
(next) replaces that file entirely, and will need to pass this same check clean.

## 2026-09-14 — feature 01, for real, merged

Rebuilt the throwaway project fresh a final time (all fixes above in place), ran `kit init
next16-insforge` — clean on the first pass. Wrote `project-overview.md`, `architecture.md`
and `build-plan.md` myself, following the three prompts exactly, for a deliberately tiny
fake product ("Ledger" — a one-entity personal reading-list app, no AI, no third-party
API beyond InsForge) chosen specifically so feature 01 wouldn't need real backend
credentials to build for real. 19 out-of-scope items, 4 data-flow diagrams, a one-table
schema, 7 numbered features across 3 phases — the same shape the blind prompt tests
produced against jobpilot.

Committed the scaffolding + planning docs as one baseline (the separate `claude -p` session
above named this as the unblock step), branched `feat/01-homepage-ui`, and built it: a real
homepage using `@ja3dan/button` (installed via `bunx shadcn add`, composed with Base UI's
`render`/`nativeButton={false}` per the component's own doc comment — not a plain `<a>` or
a nested `<button>`), contract tokens only. `bun run check` — clean (the same command that
failed with 20 raw-color errors against `create-next-app`'s untouched default page, so this
is a real pass). `bun run build` — clean. Verified visually in a live dev server: pitch and
button render with the neutral theme's tokens, clicking Sign In navigates to `/login`
(404, expected — that page is feature 03's). Merged `feat/01-homepage-ui` into the
throwaway project's own `main` with `git merge --no-ff` — no PR host for a standalone
throwaway repo, a local merge is the equivalent close.

Post-merge, on `main`: `bun run check` and `bun run build` both clean; `kit doctor --cwd
<throwaway>` — 13/13 checks pass; `kit check --cwd <throwaway>` — clean. All four commands
(`kit init`, `kit doctor`, `kit check`, and the project's own `check`) now agree the project
is in a genuinely correct state, not just an unverified one.

**Three real rough edges were hit and all three went back in as fixes to `kit init`
itself** (`cleanTailwindCss`, `wireEslintPlugin`, `ensureCheckScript`), not left as notes —
exactly what the spec's capstone criterion asked for. Harvested the ESLint-wiring one into
`knowledge/shadcn-registry.md` (stack-level, would recur for anyone else automating this
setup); the CSS one refined an existing bullet there rather than duplicating it, since the
core finding was already recorded — only the exact mechanism (verified via `git diff`
against `create-next-app`'s own commit) was new.

`bun run check` in groundwork itself: tokens, both packages' tests (62 + 0), lint,
registry:build — all clean.
