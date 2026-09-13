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

## Steps 6–7 — `kit sync update`, overwrite and merge

### How it works

1. **Refuses up front, before touching anything:**
   - no lock, or an item that isn't in it;
   - not a git repository, or uncommitted changes;
   - the registry's hash for the locked version doesn't match the lock (the base can't be
     trusted);
   - nothing newer within the track, where the message names `--to`;
   - a major update (step 8);
   - the target branch already exists.
2. **Target:** the newest version the item's track takes, or `--to <version>`.
3. **Paths:** both versions are planned from **their own** versioned URLs (step 1: a
   parent's plan only shows dependencies at current), and the item's files are located by
   basename.
4. **On a new branch `kit/<item>-<version>`, per file of the target:**
   - **added** when it isn't on disk;
   - **unchanged** when the disk already equals the new version;
   - **overwritten** when the disk equals the locked version;
   - otherwise `git merge-file` of disk / locked / new, giving **merged** or
     **conflicted**, with markers labelled `project` / `base` / `registry`.

   Files the new version no longer ships are left in place and listed.
5. **New dependencies:**
   - **Registry dependencies** that aren't installed are installed. Doing that only creates
     files, so it can't disturb the merge, and they're added to the lock.
   - **npm packages** that `package.json` doesn't list are **named in the description, not
     installed**: the package manager and the dependency field are the project's call.
6. **The lock entry** moves to the new version and hash.
7. **The description** names the item, `from → to`, "Merged cleanly." or which files
   conflicted, and one line per file.
   - **A clean update** is committed with it as the message.
   - **A conflicted update** is not committed: the files keep their markers and the
     description waits in `.git/KIT_UPDATE_MSG` for `git commit -F`. The CLI exits 1.

### A test-infrastructure bug found on the way

The update suite failed intermittently: 1 or 2 of 12, a different test each time, always
at ~5,040ms with "killed 1 dangling process". Bun's 5s default test timeout was killing
tests that drive shadcn several times. **The `timeout = 60000` added to `bunfig.toml`
in step 4 had never applied: Bun 1.4.2 ignores that key without complaint.** A probe test
sleeping 6s timed out at 5,000ms with it in place. It's now `setDefaultTimeout(60_000)` in
a `[test] preload` (`src/testing/setup.ts`). The same probe passes, and the update suite
passed 12/12 on three consecutive runs.

### Evidence

`commands/update.test.ts`, 12 tests against the fabricated registry. Chip's body is ten
numbered lines, so edits on lines 2 and 9 are guaranteed separate hunks.

- **Spec criterion 3.** Unedited chip, 1.1.0 published → `overwritten`. The file has the
  new line 9, imports stay `@/shared/cn`, and the lock entry is `1.1.0` with 1.1.0's
  history hash.
- **Spec criterion 4, non-overlapping.** Local edit on line 2, upstream change on line
  9 → `merged`. Both are present and there are no markers.
- **Spec criterion 4, overlapping.** Both sides change line 5 → `conflicted`, not
  committed. The file has `<<<<<<< project`, both versions of line 5, and
  `>>>>>>> registry`.
- **Spec criterion 7.** A clean update:
  - lands on `kit/chip-1.1.0` with a clean tree;
  - the commit message equals the description, which contains
    "Update @ja3dan/chip 1.0.0 → 1.1.0", "Merged cleanly." and
    "ui/chip.tsx: merged — local edits kept".

  A conflicted update stays uncommitted on its branch, with "Conflicted: local edits
  overlap the update in ui/chip.tsx" saved to `.git/KIT_UPDATE_MSG`.
- **New files and dependencies:** a file new in the target version is `added`; a newly
  depended-on `badge` is installed and locked at its version and track.
- **Refusals:** uncommitted changes (no branch created); already current; outside the
  `patch` track without `--to` (and accepted with it); a tampered lock hash; an item not
  in the lock.

**Real registry, built CLI, under Node: `data-table` 1.0.0 → 1.0.1**, the genuine version
pair from `fix/data-table-widths`.

1. **Setup.** A scratch project with non-default aliases, `shadcn add
   …/r/v/data-table@1.0.0.json` (18 files, 4.9s), committed.
   - **`kit lock`:** `data-table 1.0.0 behind`, and its 17 dependencies current.
   - **Edit:** the search placeholder changed and committed. 1.0.1's change is `COLUMNS`,
     near line 96; the placeholder is at line 150.
2. **`kit sync status`:** "patch update — outside its none track; edited:
   components/applications-table.tsx". `data-table` is pinned (`track: none`) in
   `registry.json`.
3. **`kit sync update data-table`:** refused, naming `--to 1.0.1`.
4. **`kit sync update data-table --to 1.0.1`:** exit 0, "Merged cleanly.", committed on
   `kit/data-table-1.0.1` with nothing uncommitted.
   - The placeholder edit and the new `COLUMNS` widths are both present, with no markers.
   - Imports are still `@/hooks/…`, `@/shared/…`, `@/ui/…`, with no `@/registry/`.
   - **With the placeholder restored, the merged file is byte-identical to 1.0.1 as shadcn
     installs it.**
   - The lock entry is `1.0.1` with hash `69528d15…`, equal to `versions.json`.
5. **`kit sync status` afterwards:** "up to date; edited", which is correct because the
   local edit is still there.

**Checks:** 39 kit tests pass, `tsc` is clean, and `bun run check` passes.

## Step 8 — migration notes

### The registry side

- **Where notes live:** `meta.migrations: { "<version>": "<note>" }`, inside the item.
  `meta` survives `shadcn build`, and the note is hashed content. So it ships with its
  version, can't be changed afterwards without a bump, and a later major keeps the notes
  of earlier ones.
- **`registry:build` enforces it.** `migrationProblem` in `version-registry.ts` runs only
  for a *new* version, one with no `public/r/v` file yet, and checks two things:
  - **the field's shape:** version keys and non-empty strings;
  - **the note:** a version whose major is above every published version's must carry a
    note for itself. First releases are exempt.
- **Probed on the real registry**, by temporarily bumping `empty-state` to 2.0.0:
  - no note → `✗ empty-state@2.0.0 is a new major version with no
    meta.migrations["2.0.0"]…`, and no `v/` file written;
  - a whitespace note → `✗ … must be a non-empty note`;
  - a real note → built, with the note carried into `v/empty-state@2.0.0.json`'s `meta`.

  Then `registry.json` was restored from a copy, the probe file deleted, and `public/r`
  rebuilt: only the script differs from `HEAD`.
- **Documented** in `apps/registry/AGENTS.md` (invariants) and the `registry-item` skill
  (step 3: when a change is major, and what the note needs).

### The kit side

- **`update` on a major:**
  - **Without `--accept-major`:** throws `MajorUpdateNeedsReview` carrying every note the
    update crosses. It reads them from the target version's item, for versions after the
    installed one up to the target. It's thrown before any branch or file is touched.
  - **With `--accept-major`:** merges as usual, and the notes go into the description under
    "Migration notes — this is a major update:".
  - **With no note published:** it still stops, and says there's no note.
- **`status`** gains `migrationNote`, meaning whether the latest version publishes a note
  for a major bump. The CLI reads "major update — has a migration note".

### Evidence

- **Spec criterion 5.** Chip 1.0.0 installed, 2.0.0 published with a note:
  - `update --to 2.0.0` rejects with `MajorUpdateNeedsReview`, whose `notes` equal
    `[{ version: "2.0.0", note }]`;
  - `HEAD` is unchanged, no `kit/` branch exists, `git status` is empty, and the file is
    byte-identical.
- **With `--accept-major`:** overwritten; the description and the commit message contain
  the note; the lock is at 2.0.0.
- **A major with no published note** is refused, and the message says so.
- **`notesBetween`** from 1.4.0 to 3.0.0 gives the 2.0.0 and 3.0.0 notes, not 4.0.0's;
  2.0.0 → 2.1.0 gives none.
- **`status`** reports `migrationNote: true` for a major published with a note.

### Test timeouts, again

A slow test (installing a new dependency, ~4.5–5s alone) died once at 5,036ms in a
combined run, with the step 6–7 preload in place. Separate runs showed the preload *does*
apply across files: a 6s probe passed alone, before `registry.test.ts`, and after it. The
cause wasn't pinned down, and a long repeated stress run was stopped. The `test` script now
passes `--timeout 60000` explicitly, as well as the preload. **Not verified:** that this
removes the intermittent failure, because it wasn't reproduced on demand. `bun run test`
passed 44/44 once afterwards (106s).

`registry-review` on the build rule: pending.

## Step 9 — `kit link`, and closing out the spec

- **`kit link [--url]` / `kit link --off`** in `src/commands/link.ts`: swaps the `@ja3dan`
  registry template in `components.json` (default `http://localhost:3100`), refusing when
  `components.json` itself is dirty — that guard is what makes `--off` trustworthy, since it
  restores from `git show HEAD:components.json` rather than anything kit remembers.
  `replaceTemplate` does a string swap when the registry entry is the plain string form (the
  common case, and the reason linking is a one-line diff), falling back to a full
  re-serialise only for the `{ url: … }` object form.
- **Tests** (`link.test.ts`, 6 cases) use two fixture registries — `published` and `local` —
  publishing the *same version number* with different content, which is exactly what an
  unreleased working-tree edit looks like. Covered: the local registry's content actually
  installs; the diff is one line; `--off` restores byte-identical and the published content
  comes back; uncommitted `components.json` is refused; linking twice or unlinking when
  already unlinked is a no-op; the default URL is `:3100`.
- **Evidence for spec criterion 6:** `points @ja3dan at the local registry, and an
  unpublished change appears in the project` installs `button` after linking and asserts the
  file content is the `local` registry's ("unreleased"), not `published`'s.

### Closing checks

- `bun run typecheck` and `bun run test` in `packages/kit`: clean, 50/50 (up from 44 — the 6
  new `link` tests), 100s.
- `bun run check` at the root: tokens, all workspace tests (`kit` + `eslint-plugin`), lint,
  and `registry:build` (24 items versioned) all pass with `packages/kit` in the workspace.
- `npm pack --dry-run` on `packages/kit`: 2 files, `dist/kit.js` (bundled — `bun build`
  inlines all 11 modules, so the tarball is self-contained) and `package.json`. Satisfies
  "contains the bin and its dependencies" without a `node_modules` — there's nothing left to
  resolve at install time.
- All nine `Done when` criteria in `spec.md` are now checked.

`registry-review` on the migration-note build rule: re-run, and it found one real gap.

### Registry review's finding, and the fix

**Important, confirmed.** `migrationProblem` only checked that a *new major* carries its
own note — it never checked that a version retains the notes of majors published before
it. But `notesBetween` (kit) reads migration notes off whichever version a project updates
*to*, not off every version crossed, so if an author forgot to copy an old major's note
forward into a later build, `registry:build` wouldn't catch it, and a project jumping past
that version would silently lose the earlier note — the exact failure mode this feature
exists to prevent, one layer up. Also flagged: `AGENTS.md`'s wording implied retention was
already build-enforced when it wasn't; `SKILL.md`'s wording was more careful but still
incomplete.

**Fix:** `migrationProblem` now also finds the immediately-preceding published version (by
semver) and fails the build if the new version's `meta.migrations` is missing any key that
version had. Monotonic retention, checked one step at a time, so it holds transitively
across the item's whole history without re-deriving it on every build.

**Verified on the real registry**, by temporarily walking `empty-state` through
1.0.1 → 2.0.0 (own note) → 3.0.0 (note that dropped `"2.0.0"`) → 3.0.0 (both notes kept):
- 2.0.0 with its own note: built, matching the existing major-note check.
- 3.0.0 with only `"3.0.0"`: `✗ empty-state@3.0.0 drops migration note(s) for 2.0.0,
  carried by 2.0.0. Copy them into meta.migrations before publishing.` — no `v/` file
  written.
- 3.0.0 with both keys: built.

`registry.json` restored from a pre-probe copy (byte-identical after), the two probe `v/`
files deleted, and `public/r` rebuilt — same as step 8's original probe. `AGENTS.md` and
the `registry-item` skill updated to describe retention as build-enforced. `bun run check`
passes.

**Minor findings not acted on:** a duplicated published-versions directory scan
(`migrationProblem` vs `historyOf`), and an unchecked cast relying on validation order —
both harmless given current control flow, left as the reviewer suggested (developer's
call, not blocking).

## CI failure after opening the PR

`bun run check` failed in CI, not locally: 7 of the update-path tests died on `git commit`
with `fatal: empty ident name`. `createProject` (`testing/fixture.ts`) ran `git init` and
committed with a per-invocation `-c user.name=… -c user.email=…` override, but that only
covers the *test helper's* own commits — kit's real `commitAll` (`src/git.ts`, what
`update` and `link` actually call) has no such override and depends on git having an
identity from somewhere. Locally that "somewhere" was my machine's global `~/.gitconfig`;
the GitHub Actions runner has none, so any commit made through the code under test — as
opposed to the test's own setup/teardown commits — failed there and nowhere else.

**Fix:** `createProject` now sets `user.name`/`user.email` in the fixture repo's local git
config, right after `git init`, so every commit inside it — the test harness's and kit's
own — has an identity independent of the environment. The `commit()` helper's now-redundant
`-c` overrides were dropped.

**Verified the failure mode and the fix**, not just re-running green: `HOME` pointed at an
empty directory (no `~/.gitconfig` to fall back to, matching a fresh CI runner) reproduced
`fatal: empty ident name` on the old code, and passed — 50/50 — on the fixed code. Also
50/50 in a normal shell, and `tsc --noEmit` clean.

## Harvest

Four things this build learned the hard way, promoted to `knowledge/`:

- Two bullets added to `shadcn-registry.md`: `--path` isn't fully isolated (still touches
  the calling project's `package.json`/install when a new npm dependency is needed), and a
  versioned item's `registryDependencies` always point at a dependency's *current* version,
  never a pinned one — each file's own merge base has to come from its own item's versioned
  URL.
- New `knowledge/bun.md`: `bunfig.toml`'s `[test] timeout` key is silently ignored by Bun
  1.4.2 (use `setDefaultTimeout` in a `[test] preload` script instead), and
  `require.resolve("<pkg>/package.json")` works under `bun test` but throws
  `ERR_PACKAGE_PATH_NOT_EXPORTED` under plain Node when the package's `exports` map omits
  `package.json` — only surfaces running the built CLI, not the test suite.
