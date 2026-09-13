# Log — 06 `/kickoff`

## 2026-09-13 — plan confirmed

Architected with the developer. The plan was confirmed before anything was built; nothing
in `prompts/` or `templates/` exists yet.

## What the architecture pass changed

The feature started as "write a prompt that generates a project's context". Measuring
jobpilot's `context/` first is what changed it into a staged workflow:

- 3,774 lines total, but only ~1,300 are generated at kickoff.
- `library-docs.md` (829 lines) is entirely third-party API patterns and cannot be written
  without reading installed packages — and writing it from model memory would manufacture
  the stale documentation that `knowledge/` exists to correct.
- `ui-registry.md` records exact class strings of components that do not exist yet.
- `progress-tracker.md` (453 lines) is written during the build, and is itself the file
  that grew past reading length and caused groundwork's feature folders.

Three decisions came out of that, in the order they cascade: plain prompts with no tool
access; three generation stages with the artifact as the interface between them; and
verification by diffing a re-derived jobpilot against the real files.

## Open, before anything else gets written

**The stage-2 length risk.** `architecture.md` is ~580 lines, and its schema section lands
late in the response — the same position where the original single-prompt design degraded.
Step 1 of the plan exists to settle this against jobpilot's real overview. If it fails,
stage 2 splits and the stage count becomes four.

## Gotchas found while reading jobpilot

- **jobpilot's skills came from `skills-lock.json`** — GitHub source plus a content hash per
  skill. Same shape as the `kit.lock.json` that 04 is designing. Worth reconciling before
  both exist.
- **`imprint` is the missing skill.** Its absence is why 06 ships no `ui-registry.md`.
  Recorded in the build plan under Later.
