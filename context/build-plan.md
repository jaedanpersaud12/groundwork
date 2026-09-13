# Build plan

Numbered so a branch (`feat/03-kit-sync`), a feature folder
(`context/features/03-kit-sync/`) and a line here all share one number.

Stages come from the plan artifact's build order. Each is done when someone other than its
author could confirm it.

---

## 01 — Design registry, minimal version ✅

Tokens, lint rule, 20+ registry items, versioned build, deployed.

**Done when:** `shadcn add @ja3dan/button` works in a blank Next 16 app and renders with
the theme. — *met.*

## 02 — Agent kit scaffold ✅

Groundwork set up the way the kit will set up every project: `skills/`, `.agents/skills/`,
`.claude/agents/`, hooks, `context/`.

**Done when:**
- [x] The skills list shows the lifecycle, groundwork-specific and vendored skills
- [x] Both review subagents are available
- [x] Each of the three hooks has been tripped on purpose and behaved
- [x] `bun run check` still passes
- [ ] A feature has actually been run through `/feature start` → `/feature finish`

## 03 — jobpilot becomes the first consumer

Swap jobpilot's local copies for installed registry items; write its `kit.lock.json`.

*Already in jobpilot, and relevant here:* a `skills-lock.json` (`version: 1`; per skill
`source`, `sourceType: "github"`, `skillPath`, `computedHash`) from installing skills out of
`JavaScript-Mastery-Pro/jsm-agent-skill` and `jakubkrehel/skills`. 04 decides whether
`kit.lock.json` absorbs it or sits beside it; 03 lives with the result. And its 426-line
`ui-tokens.md` is what the token contract replaces — measured in
`context/features/06-kickoff/plan.md`.

**Done when:** the homepage, profile and find-jobs screenshots match before and after, and
jobpilot's typecheck and lint are clean.

## 04 — `packages/kit`: sync engine

`kit sync status | update`, `kit link`. The 3-way merge against `public/r/v/*`.

*Before fixing the `kit.lock.json` schema:* jobpilot already has a lock of the same shape for
skills (see 03). Decide whether one lock covers registry items and skills, or two locks
share a format — deciding after both exist means migrating one of them.

**Done when:** an unedited file updates by overwrite; an edited file merges via
`git merge-file` against the installed version as base; a major version follows its
migration note; and each project gets its own PR.

## 05 — `packages/kit`: check and doctor

`kit check` (tokens, forbidden classes, doc drift) and `kit doctor` (required files, hooks,
stale library notes). Largely the logic now living in `packages/tokens/scripts/build.ts`
and the three hooks, lifted into a command that runs outside this repo.

**Done when:** `kit doctor` passes on jobpilot, and `kit check` fails a deliberately
introduced raw colour in a consumer project.

## 06 — `/kickoff` prompts, and `templates/`

Three plain-markdown prompts that interview someone and write `project-overview.md`,
`architecture.md` and `build-plan.md`, plus the template files a new project copies. No
tool access assumed — they work in any LLM, which is what keeps the kit's value from being
locked behind installing the kit. First preset: `next16-insforge`, from jobpilot.

**Done when:** running the three prompts against jobpilot, answering as its developer
would, produces context that survives a line-by-line diff against jobpilot's real files on
the checks in `context/features/06-kickoff/spec.md`.

*Spec, plan and log are on `feat/06-kickoff`, not merged.* The measurement they rest on:
jobpilot's `context/` is 3,774 lines, of which about 1,300 can be generated at kickoff —
the rest is copied, replaced by the token contract, written during the build, or read out
of installed packages. The first step is a test, not a build: does stage 2 hold its schema
section at ~580 lines? If not, three stages become four.

## 07 — `apps/site`

**On hold — re-scope before starting.** 08 put the explainer on `apps/registry`'s landing
page, which meets this stage's original "done when" (explain groundwork to someone who has
never seen it). A separate `apps/site` is only worth building if it has a job that page
doesn't do; write that job down here first, or drop the stage.

## 08 — Groundwork site

`apps/registry` becomes the site for the whole of groundwork, not just the registry: an
illustrated landing page, then docs for **both halves** — the agent kit (the loop, the
`context/` scaffold, the knowledge base) and the design system (the contract, and a page
per component generated from `registry.json`).

**Done when:** someone who has never seen groundwork can land on `/` and tell that it
bootstraps a repo's skills and architecture as well as its components — and get from there
to a working `shadcn add` without being told how.

## Needs a stage — `kit init`

The deterministic half of kickoff: copy `templates/<preset>/`, install the skills, run the
installs. 06 deliberately leaves it out because it needs `packages/kit` — but neither 04
(sync) nor 05 (check, doctor) includes it, so as written nothing builds it.

It carries the criterion 06 used to have: **a throwaway project goes from an empty folder
to feature 01 merged using only the kit**, with every rough edge fed back as a change.
Assign it to 05, or give it its own number, before 06 is finished.

---

## Later

- **`imprint`, and `ui-registry.md` with it.** jobpilot kept a living UI registry current
  with `imprint` (installed from `JavaScript-Mastery-Pro/jsm-agent-skill`, per its
  `skills-lock.json`); groundwork has no equivalent, so 06 ships no registry file. The file
  comes back when something maintains it.
- GitHub Action opening update PRs when a version is published
- Visual regression screenshots per item and theme in CI
- A Vite preset (sensory-safari, wyatt); more themes
- Promote the vendored design skills into `skills/` once their licences are confirmed
  (`frontend-design` is Apache-2.0 and already clear; the `better-*` family carries no
  licence file)
