# Plan — 09 `packages/kit`: `kit init`

## What we're building

A `kit init <preset>` command, run inside an already-scaffolded Next.js project (after
`create-next-app`, before any real work starts): it copies `templates/<preset>/` into the
project's `context/`, installs the 6 lifecycle skills into `.claude/skills/`, runs `shadcn
init` against the `@ja3dan/setup` registry item, and writes `kit.lock.json` — recording both
the registry items and the skills it just installed. Then a full, real proof: a throwaway
project taken from nothing through `kit init` and all three 06 prompts to a merged feature 01.

## Decisions

- **Skills and the template are bundled inside `@ja3dan/kit`'s published package**, the same
  way `@ja3dan/tokens` bundles `theme.css`. Groundwork's own `skills/` lives in the same repo
  that publishes `kit` — there's no external-dependency story the way there was for jobpilot's
  real `skills-lock.json` (which pulled from genuinely separate repos), so bundling is just
  shipping what's already next to the code that ships it. Confirmed with you.

- **`kit.lock.json` gains a `skills` section, shaped like jobpilot's real `skills-lock.json`**
  (`source`, `sourceType`, `computedHash`) but with `sourceType: "kit"` and the installing
  kit's own version instead of `"github"` and a repo path. Keeps the lock format recognizable
  against the real precedent even though the fetch mechanism differs, and leaves room for a
  GitHub-sourced skill later without a schema change — just a new `sourceType` value.

- **`kit init` assumes the Next.js scaffold already exists.** `templates/next16-insforge/`
  has no `package.json`, no `app/` — it's context-folder content, not framework files. The
  build plan's own description of this feature ("copy templates, install skills, run shadcn
  init, write the lock") doesn't include scaffolding a Next app, and `shadcn init` itself
  needs an existing `package.json` to configure. `kit init` is what runs *after*
  `create-next-app`, not instead of it.

- **The template's files land in `<project>/context/`, skills in `<project>/.claude/skills/`.**
  `templates/<preset>/`'s files (`code-standards.md`, `ui-rules.md`, etc.) are the same files
  jobpilot keeps directly under its own `context/` — that's the target, not the project root.
  Skills are flat real files at `.claude/skills/<name>/SKILL.md`, no `.agents/skills/`
  indirection layer: that split exists in groundwork only to separate its shippable skills
  from its own vendored/proprietary ones, and a fresh project has no such split to make.

- **Runtime asset resolution has a two-step lookup**: first, a `skills/`/`templates/`
  directory sitting next to the compiled `dist/kit.js` (the published-package case, populated
  by a new build step that copies both from the repo root into `packages/kit/dist/` before
  `bun build` runs); if that's not there, fall back to the monorepo root three directories up
  from `src/` (the local-dev case, so `kit init` is testable via `bun packages/kit/src/cli.ts`
  without a build step, matching how every other command in this session has been tested).

- **`kit init` runs `shadcn init <registry-base>/r/setup.json` through the existing
  `shadcn()` wrapper**, not a new one — same pinned binary every other command uses.
  `-y`/`--yes` already defaults to `true` in the installed shadcn (4.21.0, checked directly:
  `shadcn init --help`), so no extra flags are needed for non-interactive use.

- **Full throwaway-project run, not a partial proof.** Confirmed with you: build a real empty
  Next.js project, run `kit init` against it, run all three 06 prompts for a genuinely small
  fake product (chosen deliberately tiny so feature 01 doesn't need real backend credentials —
  a UI-first feature 01 needs no InsForge project to exist), implement that feature 01 for
  real, and merge it inside that throwaway repo. This is the capstone criterion carried from
  06's spec; every rough edge this run hits becomes a change in this feature, not a note.

## Assumptions

- A fresh `create-next-app` project's `components.json`-free state is exactly what `shadcn
  init` expects — true for every other use of `shadcn init <setup>` in this repo so far
  (03 was the one exception, an *existing* project needing hand-edits instead).
- The 6 lifecycle skills work identically once copied flat into `.claude/skills/` — no path
  in any `SKILL.md` assumes the `.agents/skills/` indirection layer. Worth a direct check
  during the build, not just an assumption carried through.
- A deliberately tiny fake product (something like a personal reading list or link tracker,
  no third-party API, auth optional) is honest enough proof of the mechanism — the point is
  proving `kit init` and the loop work end to end, not exercising every kind of feature a
  real product might need.

## How to build it

1. **Bundle step.** Add a script (`packages/kit/scripts/bundle-assets.ts` or inline in the
   existing build step) that copies root `skills/` → `packages/kit/dist/skills/` and root
   `templates/` → `packages/kit/dist/templates/`, run before `bun build` in `package.json`'s
   `build` script.
2. **`packages/kit/src/assets.ts`**: `resolveAssetsRoot()` implementing the two-step lookup
   above; `readSkills()` (the 6 `{name, content}` pairs) and `readTemplate(preset)` (every
   file, path + content) built on it.
3. **`packages/kit/src/shadcn.ts`**: add `initProject(cwd, url)`, a thin wrapper around the
   existing `shadcn()` helper running `["init", url]`.
4. **`packages/kit/src/lockfile.ts`**: extend `Lock` with an optional `skills` map, entries
   shaped `{ source: "kit", sourceType: "kit", version: string, computedHash: string }`.
5. **`packages/kit/src/commands/init.ts`**: orchestrates steps 1-4 in order — copy the
   template into `context/`, copy skills into `.claude/skills/`, run `initProject`, then call
   the existing `lock()` and extend its result with the skills entries.
6. **`cli.ts`**: wire `kit init <preset>` into the dispatch and `USAGE`.
7. **`packages/kit/src/commands/doctor.ts`**: populate the `"kickoff"` bucket in `REQUIRED`
   with real entries — the template's 5 files under `context/`, `features/README.md`, and the
   6 skills under `.claude/skills/` — now that `kit init` defines what they're named.
8. Typecheck, unit-test the new pieces the way `lock.test.ts`/`link.test.ts` already do for
   their commands.
9. **The full throwaway run**: scaffold a fresh Next.js app, run `kit init next16-insforge`
   against it, verify every "done when" criterion directly, then run the three 06 prompts for
   real against a small fake product, implement the resulting feature 01, and merge it inside
   that project's own git history.

## Out of scope

- A second preset — proven against `next16-insforge` only.
- `imprint`/`ui-registry.md` — not built yet, so nothing to install.
- Publishing `@ja3dan/kit` to npm for real — this feature proves the mechanism inside the
  monorepo (bundled dist), not a published-package round trip.
