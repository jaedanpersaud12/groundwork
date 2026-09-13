# Plan — 06 `/kickoff`: the prompts that write a project's context

## What we're building

Three markdown prompts in `prompts/` and one template folder in `templates/`. A person with
an idea and any LLM pastes prompt 01, answers questions across several turns, and saves the
`project-overview.md` it produces. They paste prompt 02 with that file, answer a shorter
round about the data model, and save `architecture.md`. They paste prompt 03 with both and
save `build-plan.md`. Then they copy `templates/next16-insforge/` into the repo for the
files that are house style rather than project fact. At the end they have a `context/`
folder comparable in specificity to jobpilot's, and feature 01 can start.

## The measurement this plan is built on

jobpilot's `context/` is 3,774 lines. Sorted by where the content actually comes from:

| File | Lines | Source | At kickoff? |
| --- | --- | --- | --- |
| `project-overview.md` | 241 | The developer's head | **Generated** — stage 1 |
| `architecture.md` | 582 | Interview + design decisions | **Generated** — stage 2 |
| `build-plan.md` | 496 | Derived from the two above | **Generated** — stage 3 |
| `code-standards.md` | 359 | House style + stack conventions | **Copied** |
| `ui-rules.md` | 211 | Brand answers + template | **Copied** |
| `ui-tokens.md` | 426 | — | **Replaced** by the token contract |
| `library-docs.md` | 829 | Reading installed packages | **Empty at kickoff** |
| `ui-registry.md` | 114 | Written as components get built | **Excluded** |
| `progress-tracker.md` | 453 | Written during the build | **Skeleton** |

About 1,300 lines are genuinely generated. That number is why this is three prompts and not
one, and why it is three and not six.

## Decisions

- **Plain prompts, any LLM, no tool access.** The stages are markdown a person pastes.
  Nothing may assume it can run a command, read a file, or list a directory. This is the
  decision the rest inherit: it is why `library-docs.md` cannot be generated (it needs
  `node_modules`), why the user carries artifacts between stages by hand, and why each
  prompt has to restate its own input format rather than pointing at a path.

- **The artifact is the interface between stages, not the conversation.** Stage 2 reads a
  pasted `project-overview.md`, never "what we discussed". Same reason feature plans live
  in `plan.md` instead of chat: by turn 40 the early answers are buried, and the file is
  the only thing that survives a new session, a different model, or a user who took a
  break.

- **Three stages, cut at the points where the input genuinely changes.** Stage 1 needs only
  the person. Stage 2 needs the product decided. Stage 3 needs the architecture decided. A
  fourth cut inside the interview was considered and rejected: it doubles the friction
  without changing what the model knows at the moment it writes.

- **Depth is forced, not requested.** "Be detailed" produces nothing. What produces
  jobpilot's specificity is structural pressure, and each prompt carries it explicitly:
  a required minimum count on the out-of-scope list, a rule that every page gets its own
  flow, a refusal to write a schema column without a type and a note, and an instruction to
  re-ask rather than accept a vague answer. **The out-of-scope list is the tell** — jobpilot
  has 20 items, and a model left alone writes what the product *is* and stops.

- **`library-docs.md` ships empty with its discipline header.** It is `knowledge/` scoped to
  one project — same `verified_version` and `verified_on` frontmatter, same bar of "only
  when the docs are silent or wrong", and `/harvest` promotes a note upward when a second
  project hits it. Writing API examples at kickoff from model memory would manufacture
  exactly the stale documentation the file exists to correct.

- **`ui-registry.md` is excluded rather than shipped dead.** jobpilot maintained its copy
  with an `imprint` skill that groundwork does not have. A living document with no writer
  becomes the 450-line tracker again. The build plan gains a line for the skill; the file
  comes back with it.

- **Standards and rules are copied, not generated.** House style that a model rewrites per
  project is not house style. The template carries blanks the person fills, not prose the
  model invents.

- **Verified by re-deriving jobpilot and diffing.** Each stage is tested against the *real*
  upstream file first — stage 2 gets jobpilot's actual `project-overview.md`, not stage 1's
  output — so a failure is attributable to the prompt under test rather than to its input.
  Only then does the whole chain run cold, to measure compounding drift.

## Assumptions

Each is a thing I believe and have not shown. They are listed so `/review` has something to
check, and step 1 exists to settle the riskiest one before the rest is built on it.

- **~580 lines of `architecture.md` is achievable in one response.** This is the biggest
  risk in the plan. If quality collapses in the schema section — which lands late in the
  response, exactly where the original single-prompt design failed — stage 2 has to split
  into boundaries and data model, and the stage count becomes four. The jobpilot diff will
  show this immediately, which is why it is step 1.
- **Answering "as jobpilot's developer would" is an honest enough test.** It is not blind:
  the answers are informed by having read the target. It will therefore *overstate* how well
  the prompt does with a vague founder. The spec accepts this; a cold run on a project with
  no existing context is the real proof and belongs to a later pass.
- **Three files are enough to start feature 01.** jobpilot also had standards, rules, tokens
  and library docs before it started — but the first three are the ones that describe *this*
  project, and the rest are house style that arrives by copy.
- **A person will actually complete three pastes.** Unproven. If they don't, the fix is
  probably the kit half (`kit init`), not fewer stages.
- **The token contract genuinely replaces `ui-tokens.md`.** True for a project that installs
  `@ja3dan/setup`; a plain-prompt user who skips the design system has a gap. Acceptable —
  they still get the other eight files.

## How to build it

1. **Settle the stage-2 length risk first.** Write `02-architecture.md`, feed it jobpilot's
   real `project-overview.md`, and read the schema section of what comes back. If the
   columns are vague or the invariants thin, split the stage before writing anything else.
   Record the result in `log.md` either way. Nothing downstream is written until this is
   known.
2. **`01-interview.md`.** The phased interview — product and problem, users, pages, flows
   per page, scope in and out, success criteria. Carries the anti-vagueness rules and the
   minimum counts. Test by re-deriving jobpilot's overview; diff against the real file on
   the five checks in the spec.
3. **`03-build-plan.md`.** Given both real jobpilot files, produce numbered features in
   phases with the UI/Logic split and a stated core principle. Diff.
4. **End-to-end cold run** on jobpilot, stage 1 → 2 → 3, using each stage's own output as
   the next one's input. Write down where it degrades relative to the isolated runs. This
   number is the honest quality of the thing.
5. **`templates/next16-insforge/`** — `code-standards.md` and `ui-rules.md` lifted from
   jobpilot and stripped of jobpilot, plus the empty `library-docs.md`, the short
   `progress.md` and `features/README.md`. Grep for the four product-specific names to prove
   the strip.
6. **Surface it on the site.** A `/docs/kickoff` page with the three prompts, copy buttons,
   and a plain description of what each produces. 08 has merged since this plan was
   written, and it changes how this step is done — see *What 08 changed* below. It is no
   longer the only part of the site that needs to change.

## What 08 changed

08 (the groundwork site) merged after this plan was confirmed. Four things in it bear on
step 6 and on the template:

- **The site reads the kit from the repo; it doesn't restate it.** `apps/registry/app/_site/repo.ts`
  reads `skills/*/SKILL.md`, `knowledge/*.md` and `context/` at build time, and
  `app/_site/kit.ts` fails the build when a skill or a `context/*.md` has no place on the
  site. `/docs/kickoff` should read `prompts/*.md` the same way rather than paste them into
  a page, or the prompts and the page drift the first time a prompt is revised. `CopyButton`
  and `SourceBlock` in `app/_site/code.tsx` already do the copy UI.
- **`/docs/context` and the landing page describe groundwork's own `context/`** — `overview.md`,
  `standards.md`, `build-plan.md`, `progress.md` — not what kickoff produces
  (`project-overview.md`, `architecture.md`, `build-plan.md`, plus the copied files). Once
  the template exists, those pages should show the template's tree, or say plainly that
  they show groundwork's. **An open decision for this feature**, not a detail.
- **`/docs` says kickoff isn't built yet.** Its setup section tells readers `shadcn init`
  creates no context and to copy the scaffold by hand until `/kickoff` exists. That
  paragraph changes when this ships.
- **The feature-folder tree is parsed, not just read.** `repo.ts` reads the fenced tree in
  `context/features/README.md` line by line (`  name.md   note   (by)`). If the template
  ships its own `features/README.md`, keep that exact shape, or the site's parser and the
  template diverge.

Verifying the page: `knowledge/browser-verification.md` covers what the Browser pane gets
wrong (a stalled renderer that still reports "hidden"; `resize_window` for 400px) and how
08 measured overflow instead of arguing it.

## Out of scope

As `spec.md`. The one worth restating: **`kit init` is not in this feature.** Everything
here is copy-paste by hand, deliberately, because that is what makes it work for someone who
has never installed the kit. Automating it is `kit init`, stage 09, which needs `packages/kit` from 04 and a template
from this feature.
