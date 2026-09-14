# Log — 03 jobpilot becomes the first consumer

## 2026-09-13 — plan confirmed

`plan.md` confirmed by the developer after three rounds on the architect skill: adopting
the contract's base tokens via `themes/jobpilot.css` (not just wiring the registry URL),
hand-editing `components.json` instead of re-`init`, and running unpublished `kit` via
`--cwd` instead of publishing it early. jobpilot's uncommitted `feat/09-find-jobs-ui` WIP
is an accepted cost — jobpilot is a test repo, so no coordination needed before creating a
new branch there.

## 2026-09-13 — auth-gated screenshots

`/profile` and `/find-jobs` are behind real InsForge OAuth; no dev bypass or test account
exists, and the developer couldn't log in during the session. Built a temporary,
unauthenticated route (`app/kit-preview/page.tsx` in jobpilot) exercising the actual
component usages an Explore agent traced from `/profile` and `/find-jobs` — a labeled
input+textarea+checkbox (profile), a date-range popover+calendar with a pre-selected range
(shared), and a small populated table (find-jobs). Screenshotted before and after the swap;
deleted before this feature closes.

## 2026-09-13 — table.tsx design difference, not a token bug

Installing `@ja3dan/table` overwrote jobpilot's `uppercase tracking-wide text-xs
text-text-secondary` table headers with the registry's `text-[13px] text-muted-foreground`
(no uppercase/tracking), plus a `py-3` → `py-2.5` padding shift. Confirmed via `git diff`
this is the registry item's own design, not a token-resolution bug — every other token in
the diff resolved correctly. Developer decided: accept the registry's design as canonical;
the spec's "screenshots match" criterion means functionally equivalent, not pixel-identical.
The other 7 components' diffs are clean 1:1 token renames (`bg-surface`→`bg-card`,
`text-text-primary`→`text-foreground`, `focus-visible:ring-accent`→`ring-ring`, etc.) with
no design changes — `popover.tsx` trades a `border` for `shadow-popover` (the theme's
`--depth-popover` already carries a 1px ring, so it reads the same).

## 2026-09-13 — build complete, evidence per criterion

Built kit's CLI (`bun run --filter @ja3dan/kit build`) and ran everything against jobpilot
via `--cwd`, per the plan — jobpilot's `package.json` never got a kit dependency, and
`@ja3dan/kit` stays unpublished.

- **`components.json` has a real `registries.@ja3dan` entry** — hand-added
  `"@ja3dan": "https://gw.jaedan.me/r/{name}.json"`, matching `templateFor()`'s expected
  shape in `packages/kit/src/commands/link.ts`.
- **`kit lock` writes `kit.lock.json` with all 8 items** — ran
  `node packages/kit/dist/kit.js lock --cwd ~/Projects/jobpilot`; output listed all 8 as
  `current`, and the written file has `version`/`track`/`computedHash` per item, matching
  `skills-lock.json`'s precedent shape.
- **Each of the 8 local UI copies is replaced** — `bunx shadcn add @ja3dan/button
  @ja3dan/calendar @ja3dan/checkbox @ja3dan/input @ja3dan/label @ja3dan/popover
  @ja3dan/table @ja3dan/textarea --overwrite` in one call; `git diff --stat` confirms all 8
  files changed, no new npm dependencies needed (`@base-ui/react`, `class-variance-authority`,
  `cn`, `lucide-react`, `tw-animate-css` were already present).
- **Homepage screenshot matches before/after** — verified directly, unauthenticated, at
  `http://localhost:3000`. Visually identical (hero, buttons, dashboard mockup).
- **Profile and find-jobs screenshots match before/after** — **not verified against the
  real routes**, because both are behind real InsForge OAuth and no login was available
  this session (see the auth-gated-screenshots entry above). Verified instead via the
  temporary `app/kit-preview` route exercising the same component usages
  (input/textarea/checkbox/label for profile; popover/calendar/table/label for find-jobs) —
  visually identical before/after except the accepted `table.tsx` header design change
  above. This is a real gap against the letter of the criterion; a future session with
  working credentials should confirm the actual `/profile` and `/find-jobs` pages directly.
- **`typecheck` and `lint` are clean** — `bun run lint` (eslint) produced no output;
  `bunx tsc --noEmit` produced no output. jobpilot has no dedicated `typecheck` script (only
  `dev`/`build`/`start`/`lint`), so this ran `tsc` directly rather than adding one.

Committed in jobpilot as `391ca98` on `feat/03-groundwork-consumer`, scoped to exactly the
files this feature touched — the pre-existing `feat/09-find-jobs-ui` WIP (dropdown.tsx,
context/*, lib/utils.ts, memory.md, types/index.ts, the new find-jobs app/components/lib
files) was left uncommitted and untouched, as decided.
