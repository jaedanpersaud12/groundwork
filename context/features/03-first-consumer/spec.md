# 03 — A first consuming project

## What

Wire an existing app up to the `@ja3dan` registry through `packages/kit`, then swap its 8
hand-copied UI components for kit-installed ones: `button`, `calendar`, `checkbox`,
`input`, `label`, `popover`, `table`, `textarea`. The app ends the feature with a
`kit.lock.json` and a real `registries` entry in `components.json` instead of `{}`.

## Why

Everything up through 04 (`kit lock` / `sync status` / `sync update` / `link`) has only
ever run against a throwaway fixture. A real app is the kit's first real consumer, and the
only way to know `kit lock` and the install path actually work outside a fixture built to
make them pass.

## Decisions taken before the spec

- **The app is a separate git repo**, not a groundwork workspace member. Its git history,
  PRs and review process are its own; this feature edits files there but that repo's
  commit/PR conventions apply, not groundwork's.
- **Scope is the 8 existing UI copies only** (`components/ui/*`), matched 1:1 against
  registry item names already in `apps/registry/registry.json`. The app's other component
  folders aren't registry items and aren't touched.
- **The app's own UI token notes are not replaced here.** That's 06-kickoff's job once the
  token contract is in place; 03 only needs the app's Tailwind setup compatible enough for
  the installed components to render correctly.
- **`skills-lock.json` and `kit.lock.json` stay separate files.** 04 decided one lock
  doesn't have to cover both registry items and skills; 03 lives with that result rather
  than reopening it.
- **The app has unrelated in-progress work** on another branch — including two new local
  components that happen to duplicate registry item names (`pagination`,
  `sortable-table-head`). This feature works alongside that branch rather than waiting on
  it; the overlap is not resolved by 03.

## Done when

- [x] The app's `components.json` has a real `registries.@ja3dan` entry pointing at the
      groundwork registry (via `kit link` or the deployed registry URL)
- [x] `kit lock` run against the app writes `kit.lock.json` listing all 8 installed items
      with `version`, `hash` and `track`, matching `public/r/versions.json`
- [x] Each of the 8 local UI copies (`button`, `calendar`, `checkbox`, `input`, `label`,
      `popover`, `table`, `textarea`) is replaced by the kit-installed version
- [x] Homepage screenshot matches before and after the swap — *met.* The two signed-in
      screens: **not verified against the real routes** — both are behind real auth and no
      login was available this session; verified instead via a temporary unauthenticated
      route exercising the same component usages.
- [x] The app's `typecheck` and `lint` are clean after the swap

## Out of scope

- Migrating the app's non-registry component folders
- Replacing the app's UI token notes with the token contract
- Resolving the `pagination` / `sortable-table-head` naming overlap with the in-progress
  branch
- `kit check` / `kit doctor` (05) and `/kickoff` (06)
