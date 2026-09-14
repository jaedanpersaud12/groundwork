# 10 `imprint`, and `ui-registry.md` with it

## What

A 7th lifecycle skill, `skills/imprint/SKILL.md`, installed by `kit init` alongside the
other 6. Run after building a UI component, it captures what makes that component match
the rest of the project and appends an entry to `ui-registry.md` — adapted for a groundwork
project (contract tokens already enforced; what's actually worth capturing is composition,
not class choices), not a port of jobpilot's real `imprint`.

## Why

Groundwork's own build plan flagged this from the start ("the file comes back when
something maintains it") but never shipped a maintainer. Without it, a project built
through several sessions drifts the way jobpilot's own real UI did before `imprint` existed
— not through wrong token choices (the contract prevents that), but through inconsistent
*composition*: two page headers built in different sessions that don't actually look like
they belong to the same app.

## Decisions taken before the spec

- **Not a port of jobpilot's real `imprint`.** That skill's whole extraction list (`bg-`,
  `rounded-`, `text-` classes) is exactly what the contract already owns and
  `no-raw-colors` already enforces. Capturing it again in `ui-registry.md` would agree with
  `TOKENS.md` and say nothing new. What a groundwork project's `imprint` should capture
  instead: how registry primitives get *composed* into project-specific sections, and the
  shape of any genuinely custom (non-registry) component.
- **A 7th lifecycle skill, not a groundwork-only one.** Installed by `kit init` into every
  new project, the same as `architect`/`feature`/`harvest`/`recover`/`remember`/`review` —
  matching jobpilot's own real setup, where `imprint` came from the same skill source as
  `architect`/`recover`/`remember`.

## Done when

- [x] `skills/imprint/SKILL.md` exists, adapted per the decision above (verified by reading
      it back against jobpilot's real one and confirming the extraction list actually
      changed, not just the prose around it) — *see `log.md`*
- [x] `kit init` installs 7 skills, not 6 — `packages/kit/src/assets.ts`'s `readSkills()`
      picks it up automatically (it's data-driven off `skills/`), confirmed by running
      `kit init` against a fresh project and finding `.claude/skills/imprint/SKILL.md` —
      *see `log.md`; "Installed 7 skills" against `~/Projects/kit-imprint-check`*
- [x] `kit doctor`'s `"kickoff"` bucket checks for the 7th skill — same automatic pickup,
      confirmed by running `kit doctor` against that same fresh project — *see `log.md`;
      15/15 checks pass*
- [x] `apps/registry`'s `kit.ts` build-time consistency check (every skill in `skills/` must
      appear in `LOOP` or `OUT_OF_BAND`, or the site fails to build) passes with `imprint`
      included, and the site actually describes it somewhere a reader would find it —
      *see `log.md`; the build genuinely failed first, naming `imprint`, before the fix*
- [x] `ui-registry.md` is back in `templates/next16-insforge/`, seeded with the file's
      structure but no fabricated entries — nothing to capture until a real component
      exists — *see `log.md`: `grep -c "^### " ...` → `0`, no entry headings at all*
- [x] A real run of `/imprint` against a genuinely composed (non-registry-primitive) piece
      of UI produces an entry that isn't a restatement of a contract token — demonstrated
      against something in the throwaway project from 09, or a fresh equivalent — *see
      `log.md`; composed `@ja3dan/empty-state` + `@ja3dan/button`, the resulting entry
      mentions zero contract tokens, only the composition decisions the registry items'
      own sources leave open*
- [x] `bun run check` passes — *confirmed on CI (a fresh machine), this branch: `check`
      passed in 3m28s — https://github.com/jaedanpersaud12/groundwork/actions/runs/34834544618.
      Locally it failed on 4 `update.test.ts` `chip`-fixture failures, taking ~60 minutes
      instead of ~100 seconds; ruled unrelated before CI ran (code this feature doesn't
      touch, per `git diff --stat`, reproduced identically on unmodified code) and CI now
      settles it — the local run was environmental, not a real failure. See `log.md`.*

## Out of scope

- **Audit mode** (`/imprint audit`). Real and useful in jobpilot's version — scanning an
  *existing*, already-inconsistent codebase for conflicts before tracking starts. Every
  groundwork project starts through `kit init` with a clean, contract-compliant baseline
  already, so there's nothing to audit on day one. Worth adding if a project accumulates
  enough custom composition to need it — not now.
- **Promoting `imprint` to groundwork's own `.agents/skills/`.** This repo builds the
  registry, not project UI compositions on top of it — `imprint`'s job doesn't apply here
  the way `registry-item`'s does.
