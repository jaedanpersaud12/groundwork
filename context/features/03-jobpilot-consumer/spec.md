# 03 — jobpilot becomes the first consumer

## What

Wire jobpilot (`~/Projects/jobpilot`) up to the `@ja3dan` registry through `packages/kit`,
then swap its 8 hand-copied UI components for kit-installed ones: `button`, `calendar`,
`checkbox`, `input`, `label`, `popover`, `table`, `textarea`. jobpilot ends the feature with
a `kit.lock.json` and a real `registries` entry in `components.json` instead of `{}`.

## Why

Everything up through 04 (`kit lock` / `sync status` / `sync update` / `link`) has only
ever run against a throwaway fixture — see `context/features/04-kit-sync/log.md`, which
says so explicitly. jobpilot is the kit's first real consumer, and the only way to know
`kit lock` and the install path actually work outside a fixture built to make them pass.

## Decisions taken before the spec

- **jobpilot is a separate git repo** (`~/Projects/jobpilot`, remote
  `jaedanpersaud12/jobpilot`), not a groundwork workspace member. Its git history, PRs and
  review process are its own; this feature edits files there but jobpilot's own commit/PR
  conventions apply to that repo, not groundwork's.
- **Scope is the 8 existing UI copies only** (`components/ui/*`), matched 1:1 against
  registry item names already in `apps/registry/registry.json`. jobpilot's other component
  folders (`auth`, `homepage`, `interior`, `layout`, `profile`, `find-jobs`) aren't registry
  items and aren't touched.
- **jobpilot's `ui-tokens.md` (426 lines) is not replaced here.** That's 06-kickoff's job
  once the token contract is in place; 03 only needs jobpilot's Tailwind setup compatible
  enough for the installed components to render correctly.
- **`skills-lock.json` and `kit.lock.json` stay separate files.** 04 decided one lock
  doesn't have to cover both registry items and skills; 03 lives with that result rather
  than reopening it.
- **jobpilot has unrelated in-progress work** on `feat/09-find-jobs-ui` (a find-jobs UI
  feature, worked in a separate session) — including two new local components,
  `pagination.tsx` and `sortable-table-head.tsx`, that happen to duplicate registry item
  names (`pagination`, `sortable-table-head`). This feature works alongside that branch
  rather than waiting on it; the overlap is noted under Open questions in the log, not
  resolved by 03.

## Done when

- [x] jobpilot's `components.json` has a real `registries.@ja3dan` entry pointing at the
      groundwork registry (via `kit link` or the deployed registry URL)
- [x] `kit lock` run against jobpilot writes `kit.lock.json` listing all 8 installed items
      with `version`, `computedHash` and `track`, matching `public/r/versions.json`
- [x] Each of the 8 local UI copies (`button`, `calendar`, `checkbox`, `input`, `label`,
      `popover`, `table`, `textarea`) is replaced by the kit-installed version
- [ ] Homepage screenshot matches before and after the swap — *met.* Profile and find-jobs:
      **not verified against the real routes** — both are behind real auth and no login was
      available this session; verified instead via a temporary unauthenticated route
      exercising the same component usages. See `log.md`.
- [x] jobpilot's `typecheck` and `lint` are clean after the swap

## Out of scope

- Migrating jobpilot's non-registry component folders (`auth`, `homepage`, `interior`,
  `layout`, `profile`, `find-jobs`)
- Replacing `ui-tokens.md` with the token contract
- Resolving the `pagination` / `sortable-table-head` naming overlap with the in-progress
  find-jobs branch
- `kit check` / `kit doctor` (05) and `/kickoff` (06)
