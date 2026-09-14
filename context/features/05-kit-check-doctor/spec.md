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
- **`kit doctor`'s "required files" is scoped to what's real today**, not to a full
  `/kickoff`-installed project — `/kickoff` (06) isn't built yet, so jobpilot (03's
  consumer) has no `skills/`, `.agents/skills/`, or `.claude/hooks/` to check for. Doctor's
  file/hook checks target what `kit` itself depends on (`components.json`'s `@ja3dan`
  registry entry, `kit.lock.json`), not the kickoff-installed tree — that check gets added
  when 06 exists.

## Done when

- [ ] `kit check` run against jobpilot passes cleanly
- [ ] Introducing a raw colour (e.g. a hex value or a Tailwind palette class) into one of
      jobpilot's kit-installed components makes `kit check` fail, naming the file and the
      offending class
- [ ] `kit doctor` run against jobpilot passes — `components.json` has a valid `@ja3dan`
      registry entry, `kit.lock.json` exists and every locked item's files are present
- [ ] `kit doctor` fails with a clear message when `kit.lock.json` references an item whose
      installed files are missing (simulate by deleting one)
- [ ] Both commands are documented in `kit`'s `--help` output, matching the existing
      `lock`/`sync status`/`sync update`/`link` style

## Out of scope

- Checking for `/kickoff`-installed files (skills, hooks, `context/`) — no project has been
  through kickoff yet; that check lands with 06 or 09
- "Stale library notes" beyond what's needed for the criteria above — the build-plan's
  phrase, but nothing in `kit` today tracks library/dependency staleness; scoping that
  fully is an `/architect` decision, not a `spec` one
- Auto-fixing anything `kit check`/`kit doctor` finds — both report only
