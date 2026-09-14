# 05 `packages/kit`: check and doctor

## What

Two new `kit` commands: `kit check` (tokens, forbidden classes, doc drift) and `kit doctor`
(required files, hooks, stale library notes) — largely the validation logic already living
in `packages/tokens/scripts/build.ts`'s per-theme check and `@ja3dan/eslint-plugin`'s
`no-raw-colors` rule, lifted into commands that run against a consumer project from outside
this repo, the same way `kit lock`/`sync`/`link` already do.

## Why

That validation logic only runs today inside groundwork itself — the theme check in
`bun run tokens`, the raw-colour check via ESLint wired into `apps/registry`. A consumer
project like jobpilot has neither: nothing catches a raw hex value creeping into an
installed component, or a project silently missing files `kit` or `kickoff` expect to be
there. `kit check`/`kit doctor` are that missing outside-the-repo check.

## Decisions taken before the spec

- **Reuses `no-raw-colors`'s logic, not a new implementation.** `checkClass()` in
  `packages/eslint-plugin/index.js` already does exactly this; `kit check` should call it
  (or the same logic) directly rather than re-deriving the regex.
- **`kit doctor`'s "required files" is designed around the core case, not jobpilot.** Kit
  exists to support a project bootstrapped by a future `/kickoff` + `kit init` — that
  project has `skills/`, `.agents/skills/`, `context/`, and a kit-managed
  `components.json`/`kit.lock.json`. That bootstrapped shape is the design center; jobpilot
  (a project migrated onto the contract after the fact, never through kickoff) is the
  harder, secondary case, and its gaps are an expected, honest "missing" result — not the
  thing doctor is scoped around. Concretely: the required-files check is a data-driven list
  (path + reason + "always" vs. "kickoff") so 06/09 can extend it without a redesign; only
  the "always" entries (`components.json`'s `@ja3dan` entry, `kit.lock.json`, locked items'
  files present) are populated now, since 06 doesn't exist yet to say what its files are
  named. `.claude/hooks/*` is out of scope for the same reason — see below.

## Done when

- [x] `kit check` run against jobpilot passes cleanly — *see `log.md`*
- [x] Introducing a raw colour (e.g. a hex value or a Tailwind palette class) into one of
      jobpilot's kit-installed components makes `kit check` fail, naming the file and the
      offending class — *see `log.md`*
- [x] `kit doctor` run against a hand-assembled fixture shaped like a kickoff-bootstrapped
      project passes its "always" checks and reports the not-yet-implemented "kickoff"
      checks as skipped, not failed — *see `log.md`*
- [x] `kit doctor` run against jobpilot passes its "always" checks — `components.json` has
      a valid `@ja3dan` registry entry, `kit.lock.json` exists and every locked item's files
      are present — *see `log.md`*
- [x] `kit doctor` fails with a clear message when `kit.lock.json` references an item whose
      installed files are missing (simulate by deleting one) — *see `log.md`*
- [x] `kit doctor`'s report includes the same outdated-item information `kit sync status`
      computes, reusing that logic rather than re-deriving it — *see `log.md`*
- [x] Both commands are documented in `kit`'s `--help` output, matching the existing
      `lock`/`sync status`/`sync update`/`link` style — *see `log.md`*

## Out of scope

- Concrete kickoff-shape entries in the required-files list (exact `skills/`/`context/`
  filenames) — 06 isn't built, so those names aren't known yet; the check is structured to
  take them once 06 lands, not implemented blind
- Hook validation (build-plan's "hooks") — `.claude/hooks/*` today are groundwork-repo
  checks with hardcoded paths, not something kickoff installs into consumer projects yet;
  revisit once 06 defines what, if anything, a bootstrapped project's hooks look like
- "Doc drift" for `kit check` — the build-plan names it but nothing in a consumer project
  today has docs to drift from (that arrives with 06's generated `project-overview.md`
  etc.); revisit then rather than guessing at a mechanism now
- Auto-fixing anything `kit check`/`kit doctor` finds — both report only
