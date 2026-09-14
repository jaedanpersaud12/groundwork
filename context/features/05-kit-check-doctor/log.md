# Log — 05 `packages/kit`: check and doctor

## 2026-09-13 — spec corrected before architecting

`spec.md`'s "Decisions taken before the spec" scoped `kit doctor`'s required-files check to
what jobpilot has today, explicitly excluding the kickoff-installed tree. That predates a
scope correction given mid-session: the bootstrapped project (`/kickoff` + `kit init`) is
the core case this feature is designed around; jobpilot (migrated after the fact, never
through kickoff) is the harder, secondary case. Rewrote `spec.md`'s decisions, done-when,
and out-of-scope sections to match before writing `plan.md` — see the diff on this branch.

## 2026-09-13 — plan confirmed

`plan.md` written and the two decisions it settles — tokens-check logic exported from
`@ja3dan/tokens` rather than duplicated in `kit`; "stale library notes" means `kit doctor`
surfacing `kit sync status`'s existing output, not new logic — proceeded to build on. Blueprint
confirmed today.

## 2026-09-13 — build complete, evidence per criterion

- **`kit check` run against jobpilot passes cleanly.** `bun packages/kit/src/cli.ts check
  --cwd ~/Projects/jobpilot` → `kit check: clean.`, exit 0.
- **Introducing a raw colour fails, naming the file and class.** Changed
  `components/ui/button.tsx`'s `default` variant to `bg-red-500`, reran `check`: `✗
  components/ui/button.tsx:11 \`bg-red-500\` is a raw Tailwind palette colour...`, exit 1.
  Reverted with `git checkout --`.
- **`kit doctor` run against jobpilot passes.** Both `"always"` checks (`components.json`'s
  `@ja3dan` entry, `kit.lock.json` exists) pass; all 8 locked items report no missing files.
- **`kit doctor` run against a bootstrapped-shape fixture passes, kickoff bucket skipped not
  failed.** Ran against `~/Projects/kit-doctor-fixture` (a `create-next-app` +
  `shadcn init <setup>` + `kit lock` project from earlier this session): both `"always"`
  checks pass, kickoff line prints `○ ... not checked yet, lands with 06` rather than `✗`.
- **`kit doctor` fails clearly when a locked item's files are missing.** Moved
  `components/ui/checkbox.tsx` out of jobpilot, reran `doctor`: exit 1, item table shows
  `checkbox ... missing: components/ui/checkbox.tsx`. Restored the file.
- **`kit doctor`'s report includes `kit sync status`'s outdated/missing info.** `doctor()`
  calls `status()` directly (`packages/kit/src/commands/doctor.ts`) rather than re-deriving
  it; the item table in `doctor`'s output is the same one `sync status` prints.
- **Both commands documented in `--help`.** Verified `bun packages/kit/src/cli.ts --help`
  lists `kit check` and `kit doctor` alongside the existing commands.

`bun run --filter @ja3dan/kit typecheck`, `test` (58 pass) and the full `bun run check`
(tokens, all package tests, lint, registry:build) are clean on this branch.

### The one new mechanism: resolving a project's `@import` chain

jobpilot's `app/globals.css` (its `components.json` → `tailwind.css` target) doesn't
redeclare `--background` etc. itself — those live in `@ja3dan/tokens/themes/jobpilot.css`,
pulled in by `@import`. `tokensCheck` in `check.ts` resolves that chain (bare specifiers via
`createRequire` rooted at the project, relative paths against the importing file) before
running the same `:root`/`.dark` presence check `packages/tokens/scripts/build.ts` runs
internally. Verified directly: jobpilot's real theme, with the chain resolved, reports no
missing tokens.

### Raw-colour scanning: real ESLint, not a hand-rolled scanner

`forbiddenClassesCheck` runs an in-process `ESLint` instance (flat config,
`overrideConfigFile: true`, `@typescript-eslint/parser` for TSX, `@ja3dan/eslint-plugin`'s
own `configs.recommended`) scoped to only the files `kit.lock.json` actually locks. Needed
`@typescript-eslint/parser` as a new `kit` dependency — plain `espree` can't parse TSX/JSX,
and `@ja3dan/eslint-plugin`'s `recommended` config assumes it's being composed into a
project's own working eslint config (which supplies the parser), not run standalone.

## 2026-09-13 — harvested

Two ESLint 9 flat-config traps hit while building `forbiddenClassesCheck` (a shareable
`configs.recommended` has no parser of its own; JSX support nests under
`languageOptions.parserOptions.ecmaFeatures.jsx`, not `languageOptions.ecmaFeatures`) —
both cost real debugging time and will recur for anyone standalone-linting with a shared
plugin config. `scope: stack` (`eslint-9`), verified against the installed `eslint@9.39.5`
and `@typescript-eslint/parser@8.70.0`. New file: `knowledge/eslint.md`.
