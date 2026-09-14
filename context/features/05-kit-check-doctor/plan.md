# Plan — 05 `packages/kit`: check and doctor

## What we're building

Two new `kit` commands, `packages/kit/src/commands/check.ts` and `.../doctor.ts`, wired into
`cli.ts` the same way `lock`/`sync status`/`sync update`/`link` already are. `kit check`
scans a project's kit-installed files for token-contract violations (raw colours, missing
required tokens in its theme CSS). `kit doctor` runs a small set of structural health
checks — today, the ones `kit` itself depends on; the check list is written so 06/09 can
extend it without a redesign — and folds in `kit sync status`'s existing outdated/missing
detection so one command gives a full health picture.

## Decisions

- **Raw-colour scanning reuses `@ja3dan/eslint-plugin` verbatim, via ESLint's Node API.**
  `plugin.configs.recommended` (in `packages/eslint-plugin/index.js`) is already a complete
  flat-config entry enabling only `no-raw-colors`. `kit check` adds `eslint` and
  `@ja3dan/eslint-plugin` as real dependencies (matching the "kit drives its own pinned
  tool" principle already established by `SHADCN_BIN` in `shadcn.ts`) and runs
  `new ESLint({ overrideConfigFile: true, baseConfig: [plugin.configs.recommended], cwd })`
  scoped to the locked items' file paths only — not the whole project. Confirmed with you
  earlier in this session.

- **The tokens sub-check is exported from `@ja3dan/tokens`, not duplicated in `kit`.**
  `packages/tokens/scripts/contract.ts` already has exactly the logic needed
  (`requiredTokens`, `shadows`, `typography`, `declaredIn`). Rather than re-derive ~10 lines
  in `kit` and risk the two drifting when `contract.json` changes, `packages/tokens`'s build
  step (`bun run build`, already runs `scripts/build.ts`) gains one more output: a bundled
  `validate.js` (via `bun build`, so `contract.json` is inlined as a JS literal — no runtime
  JSON-import-attribute syntax, which keeps it portable to `kit`'s `node >=20.18.1` floor),
  exported as `@ja3dan/tokens/validate`. `kit` adds `@ja3dan/tokens` as a real dependency and
  imports from there. Single source of truth; regenerating `validate.js` happens in the same
  `bun run tokens` step that already regenerates `theme.css`/`TOKENS.md`, so it can't drift
  the way a hand-copied version could.

- **The tokens sub-check resolves the project's `@import` chain, not just its literal
  `tailwind.css` file.** A project like jobpilot doesn't redeclare `--background` etc.
  itself — those are declared in `@ja3dan/tokens/themes/<name>.css`, pulled in via
  `@import "@ja3dan/tokens/themes/jobpilot.css";` in `app/globals.css` (the file
  `components.json`'s `tailwind.css` field points at). Checking only the literal file would
  report every contract-required token as missing. `kit check` resolves `@import` statements
  in that file — bare specifiers through Node resolution rooted at the project's own
  `node_modules`, relative paths against the importing file's directory — concatenates the
  result, then runs the same `:root`/`.dark` presence check `build.ts` runs internally.
  This is the one genuinely new piece of logic in this feature; flagging it because it's
  worth a second look before I build it, not because I think it's wrong.

- **`kit doctor`'s required-files check is a data-driven list, built around the bootstrapped
  project as the core case, not jobpilot.** Each entry is `{ path | check, reason, scope:
  "always" | "kickoff" }`. Only `"always"` entries are populated now — `components.json` has
  a `registries["@ja3dan"]` entry, `kit.lock.json` exists — because 06 (`/kickoff`) doesn't
  exist yet to say what its files are named. `"kickoff"` is a real bucket in the data
  structure today, just empty; 06 adds entries to it rather than doctor being redesigned. A
  `"kickoff"` entry that's present but unimplemented reports as **skipped**, distinct from
  **failed** — this is why the fixture criterion in `spec.md` asks for "skipped, not failed."

- **"Stale library notes" (the build-plan's phrase) is `kit doctor` surfacing `kit sync
  status`'s existing output, not a new staleness check.** `status()` in
  `commands/status.ts` already computes per-item `bump`, `withinTrack`, and `missing` files
  from the lock plus the registry plus the filesystem. `doctor` calls `status(cwd)` directly
  and reports items with `missing.length > 0` as failures (this is spec's "fails with a
  clear message when an item's files are missing" criterion) and items with `withinTrack`
  as informational, not failures — `kit sync status` already exists to act on those; doctor
  just surfaces them so one command gives the full picture.

- **Hook validation and "doc drift" are out of scope for this feature**, and stay out for a
  concrete reason rather than being silently dropped: `.claude/hooks/*` today are
  groundwork-repo checks with hardcoded paths, not anything 06 has decided to install into a
  bootstrapped project yet; and no consumer project has generated docs to drift from until
  06's templates exist. Both get a real design once 06 lands. Recorded in `spec.md`'s
  out-of-scope section already.

- **Testing split.** `kit check` is tested against jobpilot — it has real installed items
  and a real theme CSS with a real `@import` chain to resolve, which a hand-built fixture
  can't cheaply fake. `kit doctor` is tested against **both**: jobpilot, where the
  `"always"` checks should pass and prove doctor doesn't falsely demand kickoff-shaped files
  jobpilot was never going to have; and a hand-assembled fixture shaped like a bootstrapped
  project (an existing local one works, or a fresh `create-next-app` + `shadcn init
  <setup>` + `kit lock`), to prove the `"always"` checks pass cleanly and the `"kickoff"`
  bucket reports skipped rather than failed.

## Assumptions

- `components.json`'s `tailwind.css` field is present and points at a real file — true for
  any project that ran `shadcn init`, which `kit` already requires for every other command.
- ESLint's flat-config `ESLint` API accepts an in-memory `baseConfig` array with
  `overrideConfigFile: true` and a `files` glob scoped to specific paths, without needing an
  `eslint.config.js` in the target project — this is standard ESLint 9 flat-config usage,
  not project-specific, but worth confirming once the code is written since neither
  `packages/kit` nor `packages/eslint-plugin` currently invoke ESLint programmatically
  (only via `bun run test` and `apps/registry`'s own lint).
- One level of `@import` resolution (plus recursing into whatever *that* file imports) is
  enough for the supported pattern — a project's `tailwind.css` importing
  `@ja3dan/tokens/theme.css`, `base.css`, and one `themes/*.css`, plus its own local
  `:root`/`.dark` overrides in the same file. A project importing contract theme files
  through a longer chain than that isn't a case any current consumer (jobpilot) exercises.

## How to build it

1. `packages/tokens`: add `scripts/validate-entry.ts` (thin re-export of `declaredIn`,
   `requiredTokens`, `tokenNames`, `tokens`, `shadows`, `typography` from `contract.ts`).
   Extend `scripts/build.ts` to also run `bun build scripts/validate-entry.ts --target node
   --outfile validate.js` after generating `theme.css`/`TOKENS.md`. Add `"./validate":
   "./validate.js"` to `package.json`'s `exports` and `validate.js` to `files`. Run `bun run
   tokens` and confirm `validate.js` is produced and importable.

2. `packages/kit/package.json`: add `@ja3dan/tokens`, `@ja3dan/eslint-plugin`, and `eslint`
   (matching `@ja3dan/eslint-plugin`'s own peer range, `>=9`) as real `dependencies`.

3. `packages/kit/src/commands/check.ts`:
   - `tokensCheck(cwd)`: read `components.json`, resolve `tailwind.css`, resolve its
     `@import` chain, run `declaredIn`/`requiredTokens`/`shadows` from
     `@ja3dan/tokens/validate` against the concatenated CSS for `:root` and `.dark`, return
     missing/unknown token lists per selector.
   - `forbiddenClassesCheck(cwd)`: read `kit.lock.json`, get the locked items' file paths
     the same way `status.ts` does (`loadRegistry` + `planAdd` + `locateFiles`), run an
     `ESLint` instance scoped to just those paths with
     `@ja3dan/eslint-plugin`'s `configs.recommended`, return its results.
   - `check(cwd)`: runs both, returns a combined result; non-zero exit if either found
     anything.

4. `packages/kit/src/commands/doctor.ts`:
   - A small `REQUIRED: { path: string; reason: string; scope: "always" | "kickoff" }[]`-
     shaped check for `components.json`'s `@ja3dan` registry entry and `kit.lock.json`'s
     existence (the two `"always"` entries; `"kickoff"` starts empty).
   - Calls `status(cwd)` (from `./status`) and reports items with `missing.length` as
     failures, items with `withinTrack` as informational.
   - `doctor(cwd)`: combines both into one report; non-zero exit only on a hard failure
     (missing required file, missing locked item files) — never on an informational
     staleness note.

5. `cli.ts`: add `kit check` and `kit doctor` to the command dispatch and `USAGE` string,
   following the existing `runLock`/`runStatus` pattern (plain-table output via the existing
   `table()` helper where it fits).

6. Test `kit check` against jobpilot: clean pass first, then introduce a raw hex value or
   palette class into one of the 8 kit-installed components and confirm it fails naming the
   file and class (spec criterion 2).

7. Test `kit doctor` against jobpilot: confirm the `"always"` checks pass, then delete one
   locked item's installed file and confirm doctor fails with a clear message naming the
   item and the missing path (spec criterion 4).

8. Test `kit doctor` against a hand-assembled bootstrapped-shape fixture (reuse or rebuild
   `~/Projects/kit-doctor-fixture`): confirm the `"always"` checks pass and the `"kickoff"`
   bucket reports skipped, not failed (spec criterion 3).

9. Update `kit`'s `--help` output and confirm `bun run --filter @ja3dan/kit typecheck`/
   `test` are clean.

## Out of scope

- Kickoff-shaped required-files entries, hook validation, and "doc drift" — see `spec.md`;
  each needs a decision 06 hasn't made yet.
- Auto-fixing anything either command finds.
- A `--json` or machine-readable output mode — not asked for, and the existing commands
  don't have one either.
