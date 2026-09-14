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

## 2026-09-13 — carried to the stages that need it

This log was the only place these findings existed, on a branch nothing else reads. They
now live where the dependent work will find them:

- **The lock overlap** is in `context/build-plan.md` under 03 and 04, with the shape read
  from jobpilot's actual `skills-lock.json`: `version: 1`, and per skill `source`,
  `sourceType: "github"`, `skillPath`, `computedHash`. Skills came from
  `JavaScript-Mastery-Pro/jsm-agent-skill` and `jakubkrehel/skills`. 04's plan gains a
  decision point before its lock schema is fixed.
- **`kit init` had no stage.** This spec deferred it to "04 and 05", but neither includes
  it. It is now **stage 09** in the build plan, after 04 and 06, carrying the
  throwaway-project criterion.
- **`imprint`** is under Later. It isn't lost: jobpilot installed it from
  `jsm-agent-skill`, the same source as `architect`, `recover` and `remember`.
- **08 merged first**, and `plan.md` gains a section on what that changes for step 6.

Nothing in `prompts/` or `templates/` exists yet; the stage-2 length test is still the first
step.

## 2026-09-14 — stage-2 length risk settled: one stage is enough

Wrote `prompts/02-architecture.md`, then tested it blind: a fresh subagent with no context
beyond the prompt text and jobpilot's real `project-overview.md` (not its `architecture.md`)
was told to follow the prompt exactly and produce the output. Blinder than "answer as
jobpilot's developer would" — a genuinely separate context, not an informed one.

Result: quality did not collapse in the schema section, and held through the invariants
list after it — the exact place log.md's own risk note said the original single-prompt
design failed. All structural requirements met: a 10-row stack table (with defaults stated
where the overview left something open, e.g. sync-vs-queued execution, deployment target),
a folder tree with a one-line purpose per entry, 5 data-flow diagrams (spec needs 3), 3
schema tables with every column typed and noted (no restated-name notes), and an invariants
list of real rules, not restated features.

The generated schema and folder names differ from jobpilot's real ones (`activity_log` vs.
`agent_logs`, `lib/actions/` vs. top-level `agent/`+`actions/`, no separate `agent_runs`
table) — expected and correct, not a defect. Stage 2 only asks 3-4 questions; it cannot
re-derive implementation decisions the real build made that aren't implied by the overview
(e.g. that the resumes bucket is private and needs a storage key, not just a URL — nothing
in `project-overview.md` says the bucket must be private). The criterion is comparable
rigor, not byte-for-byte reproduction — `spec.md`'s wording ("a stack table, folder
structure with per-folder ownership, at least 3 data-flow diagrams...") is structural, and
a literal-content diff against jobpilot's file would fail every stage-2 run by design, since
none of this is knowable from the overview alone.

**Decision: one stage for architecture, as planned. No split.** Proceeding to
`01-interview.md` next.

## 2026-09-14 — `01-interview.md` written and tested

Tested by simulating both roles in one subagent, deliberately harder than "answer as
jobpilot's developer would": the Interviewer role knew only the prompt text; the Developer
role knew jobpilot's real facts but was instructed to give a short, vague first answer on
the out-of-scope phase specifically ("no auto-apply, no cover letters, no mobile app, no
notifications... that's about it, pretty standard stuff") and reveal nothing further unless
actually pushed — a genuine test of whether the prompt's rule does the pushing, not whether
a cooperative persona volunteers detail.

**It worked.** The Interviewer named the rule's own reasoning back ("four items isn't
enough... each usually drags in two or three adjacent features") and ran the "and what
about—" loop across apply-flow, resume-system, company-research, and scheduling adjacents,
taking the list from 4 items to 19 before confirming closure. Diffed the resulting
`project-overview.md` against jobpilot's real file on the five spec checks: all 6 pages
present with routes; the profile-vs-research ownership rule stated explicitly and correctly
(profile: user-only, no automated write; research: one-directional, isolated, never
feeds back); all 4 PostHog events with correct payloads (including catching that `job_found`
fires per-job, not once per search); 18 out-of-scope items (spec needs 15); checkable
success criteria including the "under 5 minutes" number.

One asymmetry worth recording: the prompt's explicit "≥10 items, three rounds of and-what-
about" instruction is scoped to phase 9 (scope out) specifically. Phase 2 (target user) got
only a single mild pushback on a vague answer, not a multi-round treatment — correct
per the prompt as written (the general "vague answer gets a sharper question" rule is
one round; the extended loop is deliberately only mandatory where a short list is the
likeliest failure). Not a defect, just noting the prompt's two anti-vagueness mechanisms
are different strengths by design.

Proceeding to `03-build-plan.md` next.

## 2026-09-14 — `03-build-plan.md` written and tested

Tested blind: a fresh subagent given only the prompt plus jobpilot's **real**
`project-overview.md` and `architecture.md` (not the stage-1/2 test outputs — this is the
isolated-input test the plan calls for; the cold, compounding-drift version comes next).

Result matches the spec's shape criteria: a stated Core Principle (correctly defaulted to
UI-first, since nothing in the overview suggested otherwise), 3 phases (Infrastructure,
Page UI, Logic wiring), 21 sequentially numbered features each with UI and/or Logic
subsections (a feature with no UI need, e.g. schema or PostHog init, correctly carries only
a Logic section rather than an invented UI one). It independently reproduced jobpilot's real
one-page-many-features pattern — profile UI, save, extraction, and PDF generation as four
separate numbered features, matching the real build-plan's 05-08 split — without having seen
the real file, which is the strongest evidence the prompt's "split by distinct operation,
use the data-flow diagrams to find the seams" instruction actually works rather than
producing one bloated "wire up the profile page" feature. It also correctly carried
invariants forward as per-feature constraints (`category=it-jobs` always, no tailoring, the
private-bucket download rule) rather than leaving them as background text.

## 2026-09-14 — end-to-end cold run, and the one real drift found

Ran the full chain cold: stage 1's own *generated* `project-overview.md` (from the interview
test above, not jobpilot's real file) fed to stage 2, and that generated `architecture.md`
fed to stage 3 alongside it — each stage seeing only the previous stage's real output, the
way an actual kickoff run would.

**Honesty check on the method itself first:** a single cold run compared to a single
isolated run (fed the real file) can't cleanly separate genuine compounding drift from
ordinary run-to-run sampling variance — two calls to the same prompt with the same input
will differ stylistically even with nothing wrong. Most of what differed between the
isolated and cold architecture outputs (whether TanStack Query or Recharts got named in the
stack table, phase count, exact schema column names) is this kind of noise, not drift, and
is called out as such rather than being written up as a finding.

**The one difference that recurred for a real, traceable reason:** the cold-chain
`architecture.md` invented a dedicated `activity_log` table, with its own granularity
decision reasoned out loud ("one row per action taken, not one row per job found"). Neither
the isolated run (fed jobpilot's real overview) nor jobpilot's own real `architecture.md`
has any such table — the real dashboard's "recent activity" is derived from `jobs`/
`agent_runs` directly, no dedicated log entity. Tracing why: stage 1's Data Ownership phase
(phase 6) asks explicitly about every entity the person names, and the anti-vagueness push
in this interview run landed on phase 9 (scope-out), not phase 6 — "recent activity" is
mentioned only as a dashboard UI element in phase 5 (flow), never surfaced as a candidate
data entity in phase 6, so stage 1's output carried it as UI copy with no ownership rule
attached. Stage 2 then had to decide, unprompted, whether that UI element needs its own
backing table — and guessed a heavier answer than the real project needed.

**The fix belongs in `01-interview.md`, not in this feature's remaining scope**: phase 6
should also ask about any data implied by a list/feed/history element noticed during phase
5, not only the entities the person volunteers when asked "what are the distinct pieces of
data." Recorded here rather than patched now — this feature's stage-2 and stage-3 prompts
already handle an underspecified entity reasonably (a guess, not a crash), and reopening
phase 6 risks the same regression stage 1's log warned about with phase 9: over-fitting the
rule to one project's specific gap instead of a general one. Worth a `/harvest`-style note
if this pattern shows up on a second real project.

Proceeding to `templates/next16-insforge/` next.

## 2026-09-14 — `templates/next16-insforge/` built

`code-standards.md` and `ui-rules.md` lifted from jobpilot's real files and stripped:
project-specific tables (the 4 PostHog events, the env var list, the approved-dependencies
list, the match-threshold constant) replaced with instructions + a blank to fill in rather
than invented content; jobpilot's exact hex values and pixel measurements in `ui-rules.md`
replaced with references to the token contract (`@ja3dan/tokens/TOKENS.md`) and the
`@ja3dan` registry components, since a project on this preset gets those instead of hand-
rolled color values. `library-docs.md` keeps only the "Before Using Any Library" discipline
header — no library sections, not even InsForge's, since the decision was "filled on first
use, never from memory." `progress.md` is a skeleton with an HTML-comment instruction where
the checklist goes. `features/README.md` is copied verbatim from groundwork's own — it was
already stack-agnostic, describing the feature-folder mechanic the kickoff-installed skills
(`architect`, `feature`, `review`, `remember`) use.

Verified per spec: `grep -rni "jobpilot\|adzuna\|browserbase" templates/next16-insforge`
returns nothing; every `insforge`/`InsForge` occurrence is a stack-level pattern (client
setup, the anon-key-vs-API-key rule), matching the preset's own name rather than a leaked
project fact.

Remaining before this feature can close: the `/docs/kickoff` site page (plan.md step 6),
and `bun run check`.

## 2026-09-14 — `/docs/kickoff` site page built

Followed 08's own pattern rather than inventing a new one: `repo.ts` gained `promptFiles()`
(reads `prompts/*.md`, extracts each file's own `# Title`) and `templateFiles(preset)` (a
recursive file listing), both read at build time the same way `contextFiles()`/
`knowledgeFiles()` already are. `kit.ts` gained `PROMPT_NOTES` and `TEMPLATE_NOTES` — one-line
notes maps checked against disk with the same "throw on drift" discipline as the existing
`CONTEXT_NOTES` check, so a fourth prompt or template file added later without a note fails
the build instead of silently missing the page.

The new page (`app/docs/kickoff/page.tsx`) shows all three prompts' real source via the
existing `SourceBlock` component (copy button included, same as a registry item's source) —
reading `prompts/*.md`, not pasting them into the page, so a prompt edit and the page can't
drift apart. Wired into the sidebar (`docs/layout.tsx`), the top nav (`header.tsx`), and the
`/docs` home's "Where to go next" cards.

Resolved the open decision `plan.md` flagged: `/docs/context` (groundwork's own `context/`)
and `/docs/kickoff` (what a bootstrapped project's `context/` looks like) are genuinely
different trees — added one clarifying paragraph to `/docs/context` linking to `/docs/kickoff`
rather than merging the two pages. Also rewrote `/docs`'s setup-section paragraph that said
kickoff "is still being built" to point at the new page instead.

Verified in the browser: `/docs/kickoff` renders all three prompts' real content with working
copy buttons and the template tree; `next typecheck` is clean; `find "Kickoff"` on
`/docs/context` confirms all four nav insertion points (header, sidebar, `/docs` cards, the
inline clarification link) resolve to `/docs/kickoff`. Neither `PROMPT_NOTES` nor
`TEMPLATE_NOTES`'s build-time consistency check threw, confirming both are in step with disk.

This closes the last item in `plan.md`'s "How to build it." Remaining: `bun run check`,
tick `spec.md`'s criteria with evidence, update `context/progress.md`, and open the PR.
