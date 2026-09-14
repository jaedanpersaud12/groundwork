# Log — 10 `imprint`, and `ui-registry.md` with it

## 2026-09-14 — plan confirmed

Read jobpilot's real, installed `imprint` skill (`.agents/skills/imprint/SKILL.md`) before
designing anything — the adaptation decision in `spec.md` is a direct response to reading
it: its extraction list is entirely things groundwork's contract already owns. Plan
confirmed today; nothing in `skills/imprint/` or `templates/next16-insforge/ui-registry.md`
exists yet.

## 2026-09-14 — build complete

Wrote `skills/imprint/SKILL.md`, restructured around the Step 1 fork (registry component
alone → nothing to capture; composition → Step 2a; custom component → Step 2b) and
`templates/next16-insforge/ui-registry.md`, seeded with structure and no fabricated entries
per the same discipline `library-docs.md` already uses. Checked, not just asserted:
`grep -c "^### " templates/next16-insforge/ui-registry.md` → `0` — no `###` entry heading
of any kind, so nothing resembling a fabricated component or composition record; the file
is 15 lines, all explanatory header, matching the criterion's "structure but no fabricated
entries" exactly.

**Automatic pickup confirmed, no code change needed** — `packages/kit`'s `readSkills()`/
`readTemplate()` and `kit doctor`'s `kickoffChecks()` are all `readdirSync`-driven (09's own
design). Ran `kit init` and `kit doctor` fresh against a new project
(`~/Projects/kit-imprint-check`): "Installed 7 skills," "Copied 6 files," and
`kit doctor` reports 15/15 (2 always + 13 kickoff: 6 template files + 7 skills), all green.

**`apps/registry`'s two build-time consistency checks did their job**: `bun run build`
failed immediately with `app/_site/kit.ts is out of step with skills/: not on the site:
imprint` the moment the skill file existed — exactly the point of that check. Added
`imprint` to `OUT_OF_BAND` (same shape as `harvest`: triggered by an event, not a loop
step; `writes` overridden to `["ui-registry.md"]`, the same override pattern `harvest` uses
for `knowledge/*.md`) and `ui-registry.md` to `TEMPLATE_NOTES`. Rebuilt clean. Verified in a
live dev server: `/docs/loop` shows `imprint` right after `harvest` with its own frontmatter
description; `/docs/kickoff`'s template tree lists `ui-registry.md`.

**The real test — does `/imprint` produce something worth having**, not just files that
exist: composed `@ja3dan/empty-state` + `@ja3dan/button` into a small
`EmptyLibrary.tsx` in the `kit-init-throwaway` project (on a throwaway `demo/imprint-check`
branch, not merged — this is a verification exercise, not a real feature of "Ledger"), then
followed `imprint`'s own Step 2a/3/4 for real. The resulting entry captures the button
`variant="outline" size="sm"` pairing for an empty-state action and the icon choice — real
decisions `empty-state`'s own source leaves open — and mentions no contract token at all,
because none of `empty-state`'s internal styling was touched. That's the design claim from
`spec.md` holding up against real code: nothing restates what `TOKENS.md`/the registry
item's source already fix. `bun run check` on that branch: clean.

**No harvest** — nothing in this feature was a tool behaving differently than documented;
it was a design adaptation of an existing skill, already the point of the feature itself
and already recorded in `spec.md`/this log.

`bun run check` in groundwork itself: `tokens`, `lint`, and `registry:build` clean. The
`test` step failed — 4 failures, all in `packages/kit/src/commands/update.test.ts`'s
`chip`-fixture cases, all involving the local HTTP fixture registry + real `shadcn` CLI
subprocess calls, and taking ~60 minutes instead of the usual ~100 seconds. Ruled out as
unrelated to this feature before moving on: `git diff --stat main -- packages/kit` shows
the *only* change in that package is `assets.test.ts`'s two updated expectation counts —
nothing touching `update.ts`, `shadcn.ts`, or `project.ts`, all unmodified since they last
passed 62/0 earlier in this same session. Reran the suite in isolation and it reproduced
the identical 4 failures on that unmodified code, with a different error message the second
time (a plan-mismatch instead of a timeout) — consistent with resource exhaustion after a
long session spawning many `bunx`/`shadcn`/dev-server subprocesses, not a deterministic
regression. CI runs on a fresh machine per run, so it's the honest tiebreaker here rather
than something to chase further locally.

## 2026-09-14 — CI confirms it, and two CodeRabbit findings fixed

`gh pr checks 12`: `check` passed in 3m28s on GitHub Actions' fresh machine — no failures,
nowhere near the ~60-minute local run. Settles it: the local failure was session-local
resource exhaustion, not a real problem with this branch's code. Updated `spec.md`'s
`bun run check` criterion from unchecked to checked, citing the CI run directly, rather than
leaving it in the ambiguous checked-with-a-caveat state CodeRabbit correctly flagged as
inconsistent (a checked box next to four described failures).

CodeRabbit's other finding was also real: `skills/imprint/SKILL.md`'s Step 2b ("Capture:")
lists interactive states as hover/focus/active and a separate accent/status-color line, but
the custom-component entry table only had a `Hover state` row — an agent following the
table literally would drop focus/active/accent from the record even though the prose right
above told it to capture them. Added `Focus state`, `Active state`, and
`Accent / status usage` rows to the table so the format can't silently under-capture what
the extraction step promises.
