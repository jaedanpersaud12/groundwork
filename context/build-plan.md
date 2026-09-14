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
`kit.lock.json` absorbs it or sits beside it; 03 lives with the result, and 09 installs
skills against it. And its 426-line
`ui-tokens.md` is what the token contract replaces — measured in
`context/features/06-kickoff/plan.md`.

**Done when:** the homepage, profile and find-jobs screenshots match before and after, and
jobpilot's typecheck and lint are clean.

## 04 — `packages/kit`: sync engine

`kit sync status | update`, `kit link`. The 3-way merge against `public/r/v/*`.

*Before fixing the `kit.lock.json` schema:* jobpilot already has a lock of the same shape for
skills (see 03), and 09 (`kit init`) will install skills. Decide whether one lock covers
registry items and skills, or two locks share a format — deciding after both exist means
migrating one of them.

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

The measurement this rests on: jobpilot's `context/` is 3,774 lines, of which about 1,300
can be generated at kickoff — the rest is copied, replaced by the token contract, written
during the build, or read out of installed packages. Settled first, before anything else
was written: does stage 2 hold its schema section at ~580 lines? It did — see
`context/features/06-kickoff/log.md`.

## 07 — retired

Was `apps/site`, a separate marketing site. Put on hold when 08 shipped an illustrated
landing page on `apps/registry` that already met this stage's original "done when." No
distinct job ever turned up for a second site, so the stage is retired rather than kept as
a permanent placeholder — numbers aren't reused, so this one stays empty. If a real need
for a separate site shows up later, it gets a fresh number.

## 08 — Groundwork site

`apps/registry` becomes the site for the whole of groundwork, not just the registry: an
illustrated landing page, then docs for **both halves** — the agent kit (the loop, the
`context/` scaffold, the knowledge base) and the design system (the contract, and a page
per component generated from `registry.json`).

**Done when:** someone who has never seen groundwork can land on `/` and tell that it
bootstraps a repo's skills and architecture as well as its components — and get from there
to a working `shadcn add` without being told how.

## 09 — `packages/kit`: `kit init`

The deterministic half of kickoff: copy `templates/<preset>/` into a new repo, install the
skills, run `shadcn init` against the `setup` item, and write the lock. Its own stage
because neither 04 (sync) nor 05 (check, doctor) includes it, and 06 deliberately leaves it
out — so without a number, nothing builds it.

Needs `packages/kit` from 04, the lock format 04 settles (one lock or two — see 04), and a
template from 06. Starts after both.

**Done when:** a throwaway project goes from an empty folder to feature 01 merged using
only the kit and the 06 prompts — and every rough edge hit along the way has gone back in
as a change here.

## 10 — `imprint`, and `ui-registry.md` with it

A 7th lifecycle skill, kickoff-installed like the other 6: after building a UI component,
capture what makes it match the rest of the project, and save it to `ui-registry.md`. Moved
off the "Later" list — see that section's old note for the jobpilot precedent this adapts.

**Not a port.** jobpilot's real `imprint` (from `jsm-agent-skill`) captures raw Tailwind
classes (`bg-`, `rounded-`, `text-`) because jobpilot had no token contract — every class
choice was a real decision worth recording. A groundwork project has a contract:
`bg-card`/`rounded-md`/`text-muted-foreground` aren't decisions, they're the only correct
answer, already enforced by `no-raw-colors` and already correct in any installed `@ja3dan`
component. Capturing them again would be a registry that agrees with the linter and says
nothing `TOKENS.md` doesn't already say.

What's actually project-specific, and un-owned by anything else: how this project
*composes* registry primitives into its own sections (a page header's icon-plus-heading
arrangement, a specific empty-state pattern), and any genuinely custom component the
project builds beyond the registry. That's the real drift risk `imprint` should guard
against — not re-litigating token choices the contract already settled.

**Done when:** `skills/imprint/SKILL.md` exists, installed by `kit init` alongside the
other 6 (`kit doctor`'s `"kickoff"` bucket and `apps/registry`'s `kit.ts` both updated to
know about a 7th skill), `ui-registry.md` is back in `templates/next16-insforge/`, and a
real run of `/imprint` against a genuinely composed (non-registry-primitive) piece of UI in
the throwaway project produces an entry that would actually help the next session build a
matching one — not a restatement of a contract token.

---

## Later

- GitHub Action opening update PRs when a version is published
- Visual regression screenshots per item and theme in CI
- A Vite preset (sensory-safari, wyatt); more themes
- Promote the vendored design skills into `skills/` once their licences are confirmed
  (`frontend-design` is Apache-2.0 and already clear; the `better-*` family carries no
  licence file)
