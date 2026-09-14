# Plan — 10 `imprint`, and `ui-registry.md` with it

## What we're building

`skills/imprint/SKILL.md`, a 7th lifecycle skill `kit init` installs alongside the other 6.
`templates/next16-insforge/ui-registry.md`, seeded empty with its structure. Small updates
to `packages/kit`'s doctor bucket and `apps/registry`'s site so both know about a 7th skill
— both are already data-driven off `skills/`, so this is verification, not new logic.

## Decisions

- **`imprint` is out-of-band on the site, like `harvest`/`remember`/`recover`**, not a
  numbered step of the loop. It runs when something happens (a UI component gets built),
  not in the loop's fixed start→architect→build→review→finish sequence — the same shape as
  `harvest` (run when something's learned) rather than `feature`/`architect`/`review` (run
  once, in order). `apps/registry/app/_site/kit.ts`'s `OUT_OF_BAND` array gets a new entry;
  its `writes` overrides to `["ui-registry.md"]`, the same override pattern `harvest`
  already uses for `knowledge/*.md`.
- **The extraction list changes shape, not just prose**, per spec.md's decision:
  - For a **custom component** (not sourced from `@ja3dan`): which contract token was
    chosen for each role — background, border, text, spacing scale — the same table shape
    jobpilot's `imprint` uses, but every value is a token utility already, never a raw
    class. This is real: the contract fixes the name, not which one a project picks for a
    given role, and nothing else records that choice.
  - For a **composition of registry primitives** (a project-specific section built from
    `@ja3dan` components): which components, in what arrangement, what spacing between
    them, and which variant/size props are used together — none of that lives in any single
    registry item's own source, so nothing else records it either.
  - Explicitly **not captured**: any token *name* choice on a registry component (its own
    source already fixes that) and anything `no-raw-colors` already forbids (nothing to
    capture — it can't exist in committed code).
- **`ui-registry.md` lives at `templates/next16-insforge/ui-registry.md`**, landing in a
  bootstrapped project's `context/` — same level as `code-standards.md`/`ui-rules.md`,
  matching jobpilot's own real `context/ui-registry.md`.
- **Seeded with structure, no fabricated entries.** A fresh project has no composed UI yet;
  writing example entries would be exactly the kind of invented content `/harvest`'s own
  rule warns against ("don't write an API example from memory" — same principle, applied to
  UI patterns instead of library docs).

## How to build it

1. Write `skills/imprint/SKILL.md`, adapted from jobpilot's real one per the decisions
   above. Keep the shape that isn't contract-specific: one-command invocation, confirm-what-
   was-captured step, "append not overwrite" rule. Drop audit mode (out of scope).
2. Write `templates/next16-insforge/ui-registry.md` — a short header explaining what the
   file is and the entry format `imprint` writes, no entries yet.
3. Verify `packages/kit`'s pickup is automatic: `readSkills()` and `kit doctor`'s
   `kickoffChecks()` are both `readdirSync(skills/)`-driven, so no code change should be
   needed — confirm by running `kit init` and `kit doctor` against a fresh project and
   checking for 7, not 6.
4. Verify `templateFiles()`'s pickup of the new `ui-registry.md` is equally automatic —
   same confirmation.
5. `apps/registry/app/_site/kit.ts`: add `imprint` to `OUT_OF_BAND`, `writes: ["ui-registry.md"]`.
   The build-time consistency check (every skill in `skills/` must appear in `LOOP` or
   `OUT_OF_BAND`) will fail the build until this lands — that's the proof it's wired in, not
   a separate check to write.
6. Run `/imprint` for real against a genuinely composed, non-registry-primitive piece of UI
   — the throwaway project's `/library` page (04, not built) doesn't exist yet, so use
   feature 01's homepage instead, composing something small on top of it (the `main`
   wrapper's layout choices count as a real composition to capture) or build one small
   composed element specifically to prove the mechanism.
7. `bun run check`.

## Out of scope

As `spec.md`: audit mode, promoting `imprint` into groundwork's own `.agents/skills/`.
