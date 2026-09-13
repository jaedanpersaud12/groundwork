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

## Step 2 — `packages/kit` scaffolded

- **Package:** `@ja3dan/kit` 0.1.0, `type: module`, `bin: kit → dist/kit.js`, Node
  ≥20.18.1 (shadcn's own floor).
- **Build:** `bun build src/cli.ts --target node` keeps the `#!/usr/bin/env node` line
  and the executable bit. `node dist/kit.js --version` → `0.1.0`, `--help` prints the
  usage, and an unbuilt command exits 1 with a message.
- **shadcn is a pinned dependency** (`"shadcn": "4.21.0"`, exact), and kit runs its own copy,
  resolved from its `package.json`, never whatever `bunx shadcn` finds.
- **`src/shadcn.ts`:** `planAdd` parses a dry run's file list; `viewFile` parses `--view`.
  These are the two places kit reads undocumented output.
- **`src/testing/fixture.ts`** is the start of step 3's harness: a real HTTP registry on
  a random port that can publish any version, and a minimal git-initialised project with
  non-default aliases.
- **`src/shadcn.test.ts`**, the format contract. The pinned shadcn runs against the
  fabricated registry:
  - the file list has the right project path and status;
  - `--view` content is byte-for-byte what `add` writes, blank lines and trailing newline
    included, with nothing written to the project;
  - on a locally edited copy, the plan says `overwrite` and `--view` still returns the
    registry's version.

  Plus parser unit tests for dependency lines, empty lines and no-content output.
- **Checks:** 7 pass. `tsc --noEmit` clean. `bun run check` passes with kit in the
  workspace (spec criterion 8, so far). CI gains `bun run --filter @ja3dan/kit typecheck`.

## Steps 3–4 — the fixture harness, and `kit lock`

### The design `kit lock` ended up with

1. **Registry from the project.** `components.json` → the `@ja3dan` template → a base
   URL, which has to end `/r/{name}.json` or kit refuses. Then `r/registry.json` and
   `r/versions.json` are fetched.
2. **One dry run over every item** (`planAdd` takes several) maps each item's files to
   their project paths with a status. 23 items took 1.3s, about the same as one. The dry
   run doesn't say which item a file belongs to, so files are matched by basename. That's
   safe because the registry's 24 basenames are unique and none uses a custom `target`,
   and kit checks it, failing loudly the day two items share a name.
3. **Which version is installed:**
   - **current** — every file is `skip (identical)` against the current version;
   - **past** — every file matches an older published version exactly, checked with
     `viewFile` per version, newest first;
   - **edited** — nothing matches, so the lock takes the version with the smallest line
     distance and reports it as edited. Sync treats the difference as local edits either
     way, so the choice only affects which base a merge starts from.
4. **Refuses to replace an existing lock** without `--force`.

### A registry change it needed

A static host can't list `public/r/v/`, and `versions.json` only had the current version.
Without a list of past versions, "which one does this project have" has no answer.
`scripts/version-registry.ts` now writes `history: { <version>: <hash> }` per item, read
back from `v/` on every build. The site's reader uses only `.version`, so nothing else
changes. `data-table`'s history records `1.0.0` as `273d685c…`, the hash `versions.json`
held before 1.0.1 shipped.

**`registry-review`: no critical or important findings.**
- **What it confirmed:** the immutability check is untouched; `history` can't disagree with
  `hash` or the `v/` files, since both come from one hash function; the site's reader still
  works; no item content or version changed; two consecutive `registry:build` runs give a
  byte-identical `versions.json`, so CI's generated-files step stays clean.
- **One minor note:** the hash algorithm now exists twice (`version-registry.ts` and kit),
  kept in step only by `registry.test.ts`. The build script's copy now says so.

### Bugs the tests and a real run caught

- **Deadlocked tests.** The fixture's `install` used `execFileSync`, which blocked the
  event loop the in-process fixture registry needed to answer shadcn. Each test hung
  until Bun's 5s timeout. Now async, with a 60s timeout in `bunfig.toml`, since tests
  drive the real CLI.
- **`planAdd` joined an array with commas** into one argument. It now takes `string | string[]`.
- **`require.resolve("shadcn/package.json")` works in Bun and fails in Node**
  (`ERR_PACKAGE_PATH_NOT_EXPORTED`), because shadcn's `exports` doesn't list
  `package.json`. The Bun tests all passed; only running `node dist/kit.js` found it. kit
  now resolves `shadcn` itself, whose `.` export is the same `dist/index.js` as its `bin`.

### Evidence

- **`registry.test.ts`:** `hashItem` equals `versions.json`'s `history` hash for **every**
  file in the real `public/r/v/` (25 files). `baseOf` and semver ordering are tested too.
- **`commands/lock.test.ts`**, all against the fabricated registry with real `shadcn add`
  installs:
  - two installed items are locked with `source`, `sourceType`, `version`, `track` and a
    `computedHash` equal to the served `versions.json`;
  - an item that isn't installed is left out;
  - a project installed at 1.0.0, with 1.1.0 then published, locks at **1.0.0** with
    1.0.0's hash (`past`);
  - an edited copy with 2.0.0 published locks at the closest version (`edited`);
  - a second `lock` is refused, and `--force` rebuilds the same file;
  - a project with no `@ja3dan` registry gets an explanation, not a fetch error.
- **Real registry, built CLI, plain Node.** `node dist/kit.js lock` in a fixture with
  `sortable-table-head` installed from the local registry and `table-card` edited by
  hand, in 2.3s:
  - `table-card` 1.0.0 was reported "edited — locked at the closest version";
    `sortable-table-head` and `motion` 1.0.0 "current";
  - all three `computedHash` values equal `apps/registry/public/r/versions.json`
    (**spec criterion 1**);
  - a second run exits 1 with the `--force` hint.
- **Checks:** 17 kit tests pass, `tsc --noEmit` is clean, and `bun run check` passes.

## Step 5 — `kit sync status`

Read-only. For each locked item, it reports:

- **The bump** to the registry's latest version (patch, minor or major), and whether the
  item's `track` takes it: `minor` takes minor and patch, `patch` takes patch only, `none`
  takes nothing.
- **Which files are edited**, meaning different from the *locked* version's content,
  derived fresh through `viewFile` rather than trusted from a hash. A file already
  identical to the latest version, when that's also the locked version, skips the extra
  call, so an up-to-date project costs one dry run.
- **Missing files.**
- **`baseChanged`**, when the registry's hash for the locked version no longer matches the
  lock. Published versions are immutable, so this is reported and never worked around.

Also listed: items installed but not locked, and locked items the registry no longer has.
Shared file location and line distance moved from `lock.ts` to `src/project.ts`.

### Evidence

`commands/status.test.ts`, 10 tests against the fabricated registry:

- **Spec criterion 2, outdated.** Installed and locked at 1.0.0, then 1.1.0 published:
  `installed 1.0.0, latest 1.1.0, bump minor, withinTrack true, edited []`.
- **Spec criterion 2, edited, separately.** A hand edit gives `edited ["ui/chip.tsx"]`
  with `bump none`. After 1.1.0 is published, it's still reported as edited, alongside the
  minor bump.
- **Behind isn't edited.** An unedited file behind a 2.0.0 publish: `bump major`,
  `withinTrack false`, `edited []`.
- **Tracks.** A `patch`-track item takes 1.0.1 (`withinTrack true`) but not 1.1.0
  (`false`).
- **The rest:** a deleted file shows as missing; an item installed after locking shows as
  unlocked; a locked item the registry dropped shows as removed; a tampered
  `computedHash` gives `baseChanged true`.
- **Writes nothing.** `git status --porcelain` is empty after `status`, with an edit and a
  newer version both present.
- **No lock:** asks for `kit lock` instead of guessing.

**Real registry, built CLI, under Node** (the fixture locked in step 4): `node dist/kit.js
sync status` printed `motion`/`sortable-table-head` 1.0.0 "up to date", and `table-card`
"up to date; edited: ui/table-card.tsx", in 2.3s.

**Checks:** 27 kit tests pass, `tsc` is clean, and `bun run check` passes.
