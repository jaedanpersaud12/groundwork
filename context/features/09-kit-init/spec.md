# 09 `packages/kit`: `kit init`

## What

A new `kit init <preset>` command — the deterministic half of kickoff. Given an empty (or
near-empty) directory and a preset name, it: copies `templates/<preset>/` into the project,
installs the lifecycle skills (`skills/*` — the 6 that `AGENTS.md` calls "the skills
kickoff installs into a new project," not groundwork's own vendored/proprietary ones), runs
`shadcn init` against the `@ja3dan/setup` registry item, and writes `kit.lock.json`. This is
the automated version of what someone follows by hand today reading `/docs/kickoff`.

## Why

06 shipped the three prompts and the `next16-insforge` template, deliberately hand-driven —
copy-paste, no tool assumed, so it works for someone with no kit installed. Someone who
*does* have the kit installed shouldn't have to run the copy/install/init/lock sequence by
hand every time; that automation is the last piece the build plan named before "bootstrap a
new project" is actually a command instead of a checklist. It's also what makes `kit`
itself a complete lifecycle tool — `lock`/`sync`/`link`/`check`/`doctor` all assume a
project that already exists; `init` is the one command that makes it exist.

## Decisions taken before the spec

- **Only the 6 lifecycle skills are installed**, not `.agents/skills/`'s groundwork-only or
  vendored ones (`better-*`, `frontend-design`, `interface-review`, `registry-item`,
  `token-change`, `variant`). Those are groundwork's own tooling for building groundwork;
  a consumer project gets the skills `AGENTS.md`'s map says kickoff installs, nothing more.
- **`kit doctor`'s `"kickoff"` bucket (05) is real but empty until this feature decides
  what a bootstrapped project's files are named.** Filling that bucket in is explicitly
  part of closing this feature, not a follow-up.

## Open, before anything else gets built

**Where do the skills and the template actually come from at `kit init` time?** `kit` is a
published, unpublished-today npm package; a consumer project running it has no access to
this monorepo's filesystem. Two real options, and this is the central `/architect` decision
for this feature:

1. **Bundle `skills/` and `templates/` inside `@ja3dan/kit`'s published package** — same
   pattern `@ja3dan/tokens` already uses for `theme.css`/`base.css`/`themes/*`. Simple, but
   means a skill edit needs a `kit` version bump to reach anyone, and `kit` grows a second,
   unrelated reason to publish.
2. **Fetch from GitHub at `init` time, recording what was fetched.** `kit.lock.json`'s shape
   was deliberately built to mirror jobpilot's real `skills-lock.json` — `sourceType:
   "github"`, a path, a `computedHash` — for exactly this day. Matches how jobpilot actually
   got its skills. Means `kit init` needs network access and a GitHub-reading path `kit`
   doesn't have today (everything else it reads comes from the `@ja3dan` registry's own
   HTTP endpoints, not raw GitHub).

Neither is obviously wrong; this is `/architect`'s first question.

## Done when

- [ ] `kit init next16-insforge` run against an empty directory copies every file from
      `templates/next16-insforge/` into it, unmodified except where a placeholder is
      documented to be filled in
- [ ] The 6 lifecycle skills land in the new project's `.claude/skills/`, each readable and
      invocable as a skill (not just files on disk — verified by actually running one, e.g.
      `/feature start 01`, in the new project)
- [ ] `shadcn init <registry>/r/setup.json` runs as part of `kit init` and produces a
      `components.json` with a real `@ja3dan` registry entry and the contract's CSS
      imports — the same end state 03 reached by hand in jobpilot
- [ ] `kit init` finishes by writing `kit.lock.json` (via the existing `lock()` in
      `commands/lock.ts`), even when it locks zero items, matching `kit lock`'s own
      documented behavior for an empty install
- [ ] `kit doctor`'s `"kickoff"` bucket (real but empty since 05) gains real entries for
      what `kit init` just installed, and passes when run immediately after `kit init` on
      a fresh project
- [ ] A throwaway project taken from an empty folder through `kit init` plus the 06 prompts
      reaches feature 01 merged, using only the kit and the prompts — carried over from 06's
      spec, which deferred it here. Every rough edge hit along the way is fed back into a
      change in this feature, not left as a note. If this genuinely can't be completed
      within this feature, that's a `not verified, because …` in `log.md`, not silence.
- [ ] Both commands' worth of new behavior is documented in `kit --help`
- [ ] `bun run check` passes

## Out of scope

- **A second preset.** `next16-insforge` is the only one; this feature proves the mechanism
  against it, not against a second stack.
- **`imprint` / `ui-registry.md`.** Still not built, per 06's spec; `kit init` doesn't
  install what doesn't exist.
- **Changing what `kit check`/`kit doctor` validate beyond the `"kickoff"` bucket.** Their
  logic (05) is otherwise untouched.
