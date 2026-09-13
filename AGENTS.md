# Groundwork

Reusable foundation for ja3dan projects: a token contract and lint rule on npm, a shadcn registry of components, and the agent kit that bootstraps new projects.

This file is an index, not a reading list. Read what the task needs.

## Map

| Path | What | Ships as |
| --- | --- | --- |
| `packages/tokens` | `contract.json` (source of truth), generated `theme.css` + `TOKENS.md`, `base.css`, `themes/*.css` | npm `@ja3dan/tokens` |
| `packages/eslint-plugin` | `no-raw-colors` rule; allowlist comes from the contract | npm `@ja3dan/eslint-plugin` |
| `apps/registry` | Next 16 site for all of groundwork: landing page, docs for the kit (read from `skills/`, `knowledge/`, `context/` at build time) and the design system; `registry.json` + `registry/groundwork/**` are the component sources; builds `public/r/*.json` | shadcn registry `@ja3dan` + the site, deployed on Vercel |
| `skills/` | The lifecycle skills kickoff installs into a new project | agent kit |
| `knowledge/` | Gotchas tagged by stack, installed into projects by kickoff | agent kit |
| `context/` | This repo's own overview, standards, build plan and feature folders | — |
| `.agents/skills/` | The skills active here: `skills/` symlinked, plus groundwork-only and vendored ones | — |

Folder-scoped `AGENTS.md` in `apps/registry` and `packages/tokens` carry the rules for those trees; they load when you work there.

Planned, not built: `packages/kit` (CLI: check, doctor, sync, link), `templates/`, `presets/`, and `apps/site` (on hold — 08's landing page may already do its job). See `context/build-plan.md`.

## Commands

```bash
bun install
bun run tokens           # regenerate theme.css/TOKENS.md and validate every theme
bun run test             # eslint rule tests
bun run registry:build   # shadcn build + versioned copies in public/r/v
bun run check            # all of the above + lint
```

Preview: `.claude/launch.json` → `registry` (port 3100).

## Invariants

- **Never edit `packages/tokens/theme.css` or `TOKENS.md`.** Change `contract.json`, run `bun run tokens`. A hook refuses the edit.
- **Components use contract tokens only.** The lint rule enforces it in `apps/registry`, at edit time and in `bun run check`.
- **Every themes/*.css defines every required token in both `:root` and `.dark`.** `bun run tokens` fails otherwise.
- **Changing a registry item's content means bumping its `meta.version`.** `registry:build` fails if a published version's content changed. Commit `public/r/v/*` — those files are the merge bases for sync.
- **Registry source files import `@/lib/utils` and `@/registry/groundwork/ui/*`**, never `@/components/*`, so install-time rewriting works.
- Read `knowledge/shadcn-registry.md` before touching registry items or setup.

## Skills

The loop, in the order it runs:

- `/feature start NN` — branch, feature folder, spec with "done when" criteria
- `/architect` — surfaces the decisions that change the build; writes `plan.md`
- `/review` — cheap checks, then a fresh-eyes subagent; writes `review.md`
- `/feature finish` — refuses to close while a criterion lacks evidence; opens the PR
- `/remember save` · `/remember restore` — across sessions, via the feature's `handoff.md`
- `/recover` — when a problem survives one corrective attempt. Stop prompting, diagnose.
- `/harvest` — promote a hard-won gotcha into `knowledge/`

Groundwork-specific: `registry-item` (add or change a registry item), `token-change` (touch the contract or a theme). Design: the vendored `better-*` family, `frontend-design`, `interface-review`, `variant`.

Subagents: `registry-review` and `tokens-review` — use before a change in either tree lands.

## Judgment, not rules

Scope is the developer's call; `/review` compares against `spec.md` but does not decide. When a rule produces something visibly worse in a real app, that is a finding about the rule — `/harvest` it rather than quietly working around it.
