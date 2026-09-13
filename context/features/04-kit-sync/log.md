# Log — 04 `packages/kit`: sync engine

## 2026-09-13 — build started

Rebased onto `main` after #4, which put 06's findings in the build plan. Two things carried
in that this plan didn't have when it was written:

- **One lock or two** (plan, "Open decision"). jobpilot's `skills-lock.json` has the same
  job as `kit.lock.json`. Has to be settled before step 4 fixes the schema.
- **09 (`kit init`) is the other consumer of the lock format**, so the choice outlives 04.

Step 1 first: the design rests on shadcn behaviour that was inferred, not run.

## Step 1 — the assumptions, run

All against shadcn **4.21.0** (the version `knowledge/shadcn-registry.md` is verified on),
the local registry served by `next dev` on :3001, and `git` 2.53.0. Fixtures were minimal:
`package.json`, `tsconfig.json` (`@/*` paths), `components.json`, an empty
`app/globals.css`, a git repo. They used **non-default aliases** (`ui: @/ui`, `lib: @/shared`,
`utils: @/shared/cn`) so a rewrite could never be mistaken for a coincidence.

| Assumption | Result |
| --- | --- |
| `add <url-to-versioned-item.json>` rewrites imports the same as `add @ja3dan/<name>` | **Holds.** `sortable-table-head@1.0.0` by URL and by name: all three files byte-identical, imports `@/shared/motion`, `@/ui/table-card`, `@/shared/cn`, and no `@/registry/` or `@/lib/utils` left anywhere. |
| `--path <tmp>` places files without otherwise touching the project | **False.** It writes the files flat into `<tmp>` — but when the item's npm dependencies are missing, it still edits the project's `package.json` and runs an install (`M package.json`, `?? package-lock.json`). That's exactly the case sync meets when a new version adds a dependency. |
| `add` works in a minimal fixture, not a full create-next-app | **Holds.** Both installs completed in under 4s. |
| A versioned item's `registryDependencies` resolve to current versions | **Holds, and matters more than the plan said.** `public/r/v/sortable-table-head@1.0.0.json` lists `@ja3dan/table-card` with no version, so a dependency seen through a parent's versioned URL is always today's. The base for each file has to come from **its own item's** versioned URL. |
| `git merge-file` is usable | **Holds.** Non-overlapping local + upstream edits: exit 0, both kept. Overlapping: exit 1 (= conflict count), markers labelled with `-L project -L base -L registry`. Unedited (mine = base): exit 0, result equals upstream. |
| `meta.migrations` doesn't exist yet | **Holds.** No `migration` key in `registry.json` or the build script. |

### What replaces `--path`: `add --dry-run --view <file>`

- **What it does:** prints the named file's content with the project's aliases already
  applied. It writes nothing and installs nothing (`git status` empty afterwards, run in a
  fixture with no dependencies installed).
- **Length:** it prints the whole file, not a preview. `components/applications-table.tsx`
  from `data-table@1.0.1`, 296 lines, came back as 296 content lines on stdout.
- **Exactness:** each content line is prefixed `│ │ `. Stripping that prefix gave output
  **byte-identical** to the installed file, for all three files of `sortable-table-head`.
- **Target paths:** plain `--dry-run` lists each file's project path, so kit can find the
  path to pass to `--view`.
- **The cost:** this parses CLI output that isn't a documented interface. A shadcn upgrade
  could change the decoration.

## Decided after step 1

- **Bases come from `add --dry-run --view`**, not `--path`. Zero writes, no installs, and
  verified byte-identical. The price is parsing undocumented output, so kit pins the shadcn
  version it drives and carries a test that fails if the `│ │ ` format changes.
- **Two locks, one shape.** `kit.lock.json` mirrors `skills-lock.json`: `version`, then per
  entry `source`, `sourceType`, `computedHash`, plus `version` and `track`. Kit doesn't touch
  `skills-lock.json`. The schema is in `plan.md`. The spec's "hash" is `computedHash`, the
  same value as `versions.json`.
