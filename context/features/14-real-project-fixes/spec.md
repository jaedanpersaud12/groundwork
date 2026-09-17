# 14 Fixes from real projects

## What

A batch of fixes to the kit, registry, docs, skills and knowledge, from two real projects
built on groundwork this week: one by this repo's own agent (a design-and-build client site),
one by a different agent in a sandboxed, non-Claude harness (a gallery site). Every reported
issue is triaged below — verified against the source before it was accepted — and each "fix"
becomes a done-when criterion.

## Why

Both projects hit the kit doing the wrong thing silently at an edge the happy path never
reaches: a lock rebuild that drops the skills, a doctor that passes with the kickoff outputs
deleted, a `.gitignore` that swallows the skills the kit just installed. Each cost real time,
and each will cost the next project the same unless it's fixed at the source.

## Triage

**Sources:** *A* = the other agent's report (numbered as it numbered them). *B* = this repo's own
session (from its logs and knowledge notes).

| # | Issue | Verified | Verdict |
| --- | --- | --- | --- |
| A1 | `kit check` requires a full `.dark` set; no way to declare a light-only theme, and nothing says dark is mandatory | `tokensCheck` loops `[":root", ".dark"]` unconditionally | **Fix** — a `light-only` marker kit honours; say so in the error, the theme header and the tokens docs |
| A2 | `kit doctor` doesn't check the three kickoff outputs | `kickoffChecks()` covers template files and skills only | **Fix** — check `project-overview.md`, `architecture.md`, `build-plan.md` and their required sections; pending (not failing) until the first feature folder exists |
| A3 | `kit init` failed once with `ConnectionRefused downloading package manifest`, then worked | That error is `bunx` fetching `@ja3dan/kit` itself — before kit runs, so kit can't retry it | **Partly** — retry-with-backoff and a "usually transient" message on kit's *own* registry fetches; docs note for the `bunx` download |
| A4 | `bunx` EPERM on the default tempdir in a file sandbox | Environmental | **Docs** — `TMPDIR` / `BUN_INSTALL_CACHE_DIR` note in setup |
| A5 | `create-next-app .` checks the parent's writability | Environmental (create-next-app) | **Docs** — scaffold into a subdir and move up; plus B3 |
| A6 | Stale `.next/types` after restructuring into route groups; `--skip-install` skips typegen so the first `check` fails on `LayoutProps` | Hit by both projects | **Docs + knowledge** — run `next typegen` after scaffolding and after moving routes |
| A7 | No `select` (and no `dialog`, `card`, `badge`) in the registry | Registry item list | **Fix `select` now** as `@ja3dan/native-select` (both projects hand-rolled the same thing). `dialog` / `alert-dialog` are stage 16; `card` is `Panel` in stage 18; `badge` is `status-pill` — **no new item** |
| A8 | Nothing lists what's installable | No such command | **Fix** — `kit list` |
| A9 | InsForge CLI appends `.claude` to `.gitignore`; new skill files are silently ignored | Reproduced in both projects | **Fix** — `kit doctor` checks the kit's own files aren't git-ignored and names the fix; knowledge note |
| A10 | The loop is invoked through Claude slash commands; other harnesses have no way in | Skills are prose, commands are Claude Code's | **Docs** — a "no slash commands" manual sequence on `/docs/loop` and in `skills/README.md` |
| B1 | `kit lock --force` rewrites the lock without the `skills` block `kit init` wrote | `lock()` builds `result` with no `skills` | **Fix** — carry existing skill entries over |
| B2 | No way to update a project's skills after a kit release — they were copied by hand | No command | **Fix** — `kit skills status` / `kit skills update`, hash-aware like `sync` |
| B3 | `kit init` in a directory with no app fails with "No readable components.json", which reads as a shadcn problem | `initProject` runs before any check | **Fix** — fail first with "no package.json / Next app here — run create-next-app first" |
| B4 | Architect skill reads `context/overview.md`; the kickoff prompt writes `project-overview.md` | grep | **Fix** — one name, `project-overview.md` |
| B5 | Registry `DataTable`: `sr-only` text in a cell is absolutely positioned with no positioned ancestor inside the scroll container, so on a phone the page scrolls to the table's `minWidth` | Reproduced at 375px | **Fix** — container is `relative` (table-card patch) |
| B6 | shadcn base components (`dialog`, `sheet`, `sidebar`) use `size="icon-sm"`; the registry button has no such size, so adding them fails typecheck | Reproduced | **Fix** — `icon-sm` and `icon-xs` sizes on `@ja3dan/button` (minor) |
| B7 | shadcn overlays use `bg-black/*`; no contract token fits | Reproduced | **Later** — `scrim` token added to stage 15's scope |
| B8 | shadcn's `use-mobile` fails `react-hooks/set-state-in-effect` | Reproduced | **Later** — stage 17 ships the sidebar with a `useSyncExternalStore` hook; knowledge note now |
| B9 | Gotchas learned building the consumer (React 19 form reset and native selects, Base UI `nativeButton` link role, `_folder` isn't a route, InsForge `db query` can't switch roles, npm staged publish 409, `kit init` + create-next-app demo page) | Each verified in its session | **Knowledge** — harvest into `knowledge/` |
| B10 | Loading skeleton 1px taller than the loaded table | one consumer only | **Later** — stage 19's done-when already measures shift |
| C1 | Table columns wider than their content: the name column took the spare width while dates and status pills truncated beside it (developer, screenshot of the consumer's inbox) | Reproduced: `columns={["", "w-44", "w-40", "w-28", "w-36", "w-14"]}` | **Fix** — a column-sizing rule in `app-ui` §5 and on `DataTable`'s `columns` docs; the consumer's tables resized |

## Done when

- [ ] **A1** A theme containing `/* @ja3dan/tokens light-only */` passes `kit check` with no `.dark`
      block; without the marker the error names the marker; `neutral.css`'s header and the tokens
      docs page say `.dark` is required unless marked; covered by a kit test
- [ ] **A2** `kit doctor` reports `project-overview.md`, `architecture.md`, `build-plan.md` in
      `context/`: pending while no `context/features/NN-*` folder exists, failing once one does if a
      file or a required section is missing; covered by tests
- [ ] **A3** kit's registry fetches retry with backoff on network errors and 5xx, and the final
      error says it's usually transient; `/docs` notes the same for the `bunx` download; covered by a test
- [ ] **A4 A5 A6** `/docs` setup covers sandbox temp dirs, scaffolding at a repo root, and
      `next typegen`; knowledge has the typegen trap
- [ ] **A7** `@ja3dan/native-select` exists, installs into a blank app, passes `no-raw-colors`, has an
      example on the docs page
- [ ] **A8** `kit list` prints every installable item with tier, version, description and whether
      it's installed
- [ ] **A9** `kit doctor` fails, naming the rule and the fix, when `.gitignore` ignores
      `.claude/skills/*`, `context/` or `kit.lock.json`; covered by a test
- [ ] **A10** `/docs/loop` and `skills/README.md` give the manual sequence for harnesses without
      slash commands
- [ ] **B1** `kit lock --force` keeps the lock's `skills`; covered by a test
- [ ] **B2** `kit skills status` shows current / outdated / edited / missing / new per skill;
      `kit skills update` installs outdated, missing and new skills, refuses edited ones unless
      `--force`, and updates the lock; covered by tests
- [ ] **B3** `kit init` without a `package.json` fails before touching anything, with the
      create-next-app instruction
- [ ] **B4** no skill, prompt or template refers to `overview.md` except as `project-overview.md`
- [ ] **B5 B6** `table-card` and `button` published with bumped versions and passing `registry:build`
- [ ] **B9** knowledge files updated with verified versions and dates
- [ ] **C1** `app-ui` §5 and `table-card`'s `columns` comment state the sizing rule; the consumer's inbox shows full dates and statuses with no column holding more than ~2× its content
- [ ] `bun run check` passes; kit (and tokens, if touched) published; the consumer project updated through
      `kit skills update` and `kit sync update`

## Out of scope

- Filing these as GitHub issues (needs the owner's go-ahead)
- The stage 15–19 components and tokens (B7, B8, B10 recorded into those stages)
- Retrying `bunx`'s own package download — it happens before kit's code runs
