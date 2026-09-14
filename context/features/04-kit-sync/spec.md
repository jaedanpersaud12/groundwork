# 04 — `packages/kit`: sync engine

## What

A new workspace package `packages/kit`, published as `@ja3dan/kit`, with four commands a
consumer project runs against the registry:

- `kit lock` — write `kit.lock.json` in a project that has installed items but no lock
- `kit sync status` — what's outdated, and what's been edited locally
- `kit sync update <item>` — overwrite when unedited, 3-way merge when edited, migration
  note on major; lands on a branch with a PR-ready description
- `kit link` — point a project at the registry on localhost so a component change can be
  tested inside a real app before it ships

## Why

Registry items are copied into projects, which is what makes them editable and also what
makes them go stale. Without sync, "update the button everywhere" is a manual pass over
every project, and a project that edited its copy is punished for it. The versioned copies
in `apps/registry/public/r/v/` already exist for exactly this — they are merge bases with
nothing yet using them.

## Decisions taken before the spec

- **Tested against a fixture, not a real app.** 03 isn't done, and 04 shouldn't wait on it.
  The feature creates a throwaway Next app, installs items into it, and proves every
  criterion there. Real-project testing stays in 03.
- **Published to npm as `@ja3dan/kit`**, consistent with `@ja3dan/tokens` and
  `@ja3dan/eslint-plugin`. Not `bunx github:` — groundwork is a monorepo and subdirectory
  resolution would need verifying before being relied on.
- **All four commands in scope.** `lock` is first because `status` and `update` do nothing
  without it.

## Done when

- [x] `kit lock` in the fixture writes `kit.lock.json` listing every installed item with
      `version`, `hash` and `track`, and the hashes match `public/r/versions.json`
- [x] `kit sync status` reports an item as outdated after its `meta.version` is bumped and
      the registry rebuilt, and separately marks a locally-edited file as edited
- [x] `kit sync update <item>` on an **unedited** file replaces it and bumps the lock entry
- [x] `kit sync update <item>` on an **edited** file merges via `git merge-file` using
      `public/r/v/<name>@<installed>.json` as the base — a non-overlapping local edit
      survives the update; an overlapping one leaves conflict markers rather than
      silently picking a side
- [x] A major-version update surfaces the item's migration note instead of merging silently
- [x] `kit link` makes the fixture resolve `@ja3dan/*` from `localhost:3100`, and an
      un-published change to a groundwork component appears in the fixture
- [x] The update lands on a branch in the fixture with a description naming the item, the
      version change and whether it merged or conflicted
- [x] `bun run check` passes with `packages/kit` in the workspace
- [x] `npm pack` produces a tarball containing the bin and its dependencies
      *(publishing itself is the developer's call, not this feature's)*

## Out of scope

- `kit check` and `kit doctor` — feature 05
- `templates/`, `presets/`, `/kickoff` — feature 06
- Moving an existing app onto the registry — feature 03
- Actually publishing to npm, and any GitHub Action that opens update PRs automatically
- Updating more than one project in one invocation — the plan's multi-project table is
  worth having, but it needs more than one real consumer to be worth designing
