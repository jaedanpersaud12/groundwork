# Plan — 04 `packages/kit`: sync engine

## What we're building

A new workspace package `packages/kit`, published as `@ja3dan/kit`, exposing `kit lock`,
`kit sync status`, `kit sync update <item>` and `kit link`. A consumer project runs it to
find out which installed registry items are behind, and to update them — overwriting when
the local copy is untouched, and 3-way merging when it isn't. kit itself never parses or
rewrites a component; it drives `shadcn` to produce every version it needs and uses
`git merge-file` to reconcile them.

## Decisions

- **kit never rewrites import aliases; shadcn does.** The merge base in `public/r/v/`
  stores registry-dialect imports (`@/registry/groundwork/ui/filter-chip`) while the
  installed file has project-dialect ones (`@/components/ui/filter-chip`). Merging those
  directly appears to work on unchanged imports and silently writes a broken import the
  moment a new version adds one — and the build cannot catch it. So every side of the
  merge is produced by `shadcn add`, and kit only ever handles text that shadcn already
  put in project dialect. Reimplementing the rewrite was rejected: `knowledge/shadcn-registry.md`
  already records that install-time rewriting has non-obvious edges, and a second
  implementation would drift from the first without anything failing loudly.

- **The base is derived on demand, not cached.** `public/r/v/<name>@<version>.json` is a
  complete, self-contained, `$schema`-valid item with inline content, served as a static
  asset. So `shadcn add <registry>/r/v/button@1.2.0.json --path <tmp>` reconstitutes the
  locked version in project dialect whenever it's needed. Nothing is added to the consumer
  project, there is no cache to invalidate, and **edit detection comes free**: the diff
  between the file on disk and the derived base *is* the local edit. That also fixes a
  case a recorded hash gets wrong — a project already edited before `kit lock` ever ran
  would otherwise have its edits recorded as pristine.

- **`kit link` rewrites `components.json`, `kit link --off` restores it.** Works against
  what feature 01 already shipped: no change to the `setup` item, no published version to
  bump, nothing unverified underneath. The cost is that `components.json` is committed, so
  a linked project carries a dirty file — kit guards by refusing to link when
  `components.json` already has uncommitted changes, and by printing the restore command
  on every link. The env-var alternative (`${JA3DAN_REGISTRY_URL}` in the registry URL) is
  cleaner and stays open: shadcn has a `MISSING_ENV` code and an env reader, so it is
  probably supported, but it would change what `setup` writes into every consumer and is
  not worth that on inferred behaviour.

- **The fixture gets its own registry.** Testing "a major version surfaces its migration
  note" against the real registry would mean bumping a real item to 2.0.0 to produce a
  test condition. The fixture serves its own small registry instead, so versions can be
  fabricated freely and the real one stays honest.

- **`hash` stays in the lock** even though edit detection no longer needs it. It becomes
  an integrity check on the derived base: if the hash of the item JSON fetched for
  `button@1.2.0` doesn't match what was locked, a published version's content changed
  underneath us, which is precisely what the registry's immutability rule forbids. Cheap,
  and it catches a class of failure nothing else would.

## Assumptions

Each rests on behaviour I inferred rather than ran. Step 1 exists to settle them **before**
anything is built on top — if one fails, the design changes, not the schedule.

- `shadcn add <url-to-versioned-item.json>` accepts a direct URL and applies the **same**
  alias rewriting as a namespaced `@ja3dan/...` add. The whole base-derivation rests on
  this.
- `--path <tmp>` places the file where we ask without otherwise touching the project.
- `shadcn add` works against a **minimal** fixture (`components.json`, `tsconfig.json`,
  `package.json`) rather than needing a full `create-next-app`. If it doesn't, the fixture
  gets slower, not different.
- A versioned item's `registryDependencies` resolve to *current* versions, not historical
  ones. Acceptable: we read only the target file out of the temp install and discard the
  rest — but it means the temp install is noisy and possibly slow.
- `git` is available and `git merge-file` is usable. kit hard-depends on git; it already
  needs it to branch.
- `meta.migrations` does not exist in `registry.json` yet and has to be added, which is a
  registry schema change — so it goes through the `registry-item` skill and
  `registry-review`, not a quiet edit.

## Open decision — one lock or two

Found by 06's architecture pass, recorded in `context/build-plan.md` under 03 and 04, and
not considered when this plan was written: **jobpilot already has a lock file of the same
shape for skills.** Its `skills-lock.json`, as committed:

```json
{
  "version": 1,
  "skills": {
    "architect": {
      "source": "JavaScript-Mastery-Pro/jsm-agent-skill",
      "sourceType": "github",
      "skillPath": "skills/architect/SKILL.md",
      "computedHash": "62908472…"
    }
  }
}
```

Both record a source, an identity and a content hash for something copied into a project
that may later drift from upstream. Whatever `kit.lock.json` becomes, 03 has to live with it
beside that file, and 09 (`kit init`) installs skills and writes the lock — starting from
whatever this feature decides. So before step 4 fixes the schema, decide:

- **One lock** — `kit.lock.json` gains a `skills` section, and kit eventually owns skill
  installs too. Fewer files; kit takes on a job the external skills CLI already does.
- **Two locks, one shape** — `kit.lock.json` mirrors `skills-lock.json`'s conventions
  (`version`, `source`, `sourceType`, a computed hash) so a later merge is mechanical.
- **Two locks, unrelated** — what this plan assumed by default. Cheapest now, and the one
  that makes a later merge a migration.

Not a reason to widen 04: sync for skills is still out of scope. It is only about not
choosing a lock format that has to be migrated the first time both files meet.

## How to build it

1. **Settle the assumptions.** Serve the registry locally, point a scratch project at a
   versioned URL, and confirm shadcn installs it in project dialect. Write the result into
   `log.md` either way. Nothing else starts until this is known.
2. **Scaffold `packages/kit`** — `@ja3dan/kit`, `type: module`, TS source built with
   `bun build` to `dist/` plus a `bin` shebang so `npx` works and not only `bunx`. Joins
   the workspace with no root config change (`workspaces: ["apps/*", "packages/*"]`).
3. **Fixture harness** — a script that creates a minimal consumer project and a small
   fabricated registry beside it, with items at known versions. Everything after this step
   is testable without the network or the real registry.
4. **`kit lock`** — *after the open decision above is settled.* Read `components.json` +
   installed files, resolve each to a registry item, write `kit.lock.json` (`registries`, then `items` keyed `@ja3dan/<name>` with
   `version`, `hash`, `track` defaulted from the item's `meta.track`).
5. **`kit sync status`** — compare the lock against the registry's `versions.json`; derive
   each base and diff against disk to mark edited copies. Read-only; prints the table.
6. **`kit sync update`, overwrite path** — unedited file, new version replaces it, lock
   entry bumped.
7. **`kit sync update`, merge path** — derive base, `git merge-file` disk/base/new. A
   non-overlapping local edit survives; an overlapping one leaves conflict markers rather
   than picking a side.
8. **Migration notes** — add `meta.migrations` to the registry item schema and surface the
   note on a major bump instead of merging. Registry change: bump `meta.version`, run
   `registry-review`.
9. **`kit link` / `--off`** — with the dirty-`components.json` guard.
10. **Package check** — `bun run check` green with kit in the workspace; `npm pack`
    produces a tarball containing the bin and `dist/`. Publishing stays the developer's
    call.

## Out of scope

- `kit check`, `kit doctor` — feature 05
- Updating call sites from a migration note. This feature *surfaces* the note; rewriting
  the code that calls a changed component is a bigger job and belongs with a real consumer.
- Multi-project sync (`--projects jobpilot,bran`) — needs more than one real consumer
  before the design is anything but guesswork
- Actually publishing to npm, and any GitHub Action opening update PRs
- `templates/`, `presets/`, `/kickoff` — feature 06
