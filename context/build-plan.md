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

**Done when:** the homepage, profile and find-jobs screenshots match before and after, and
jobpilot's typecheck and lint are clean.

## 04 — `packages/kit`: sync engine

`kit sync status | update`, `kit link`. The 3-way merge against `public/r/v/*`.

**Done when:** an unedited file updates by overwrite; an edited file merges via
`git merge-file` against the installed version as base; a major version follows its
migration note; and each project gets its own PR.

## 05 — `packages/kit`: check and doctor

`kit check` (tokens, forbidden classes, doc drift) and `kit doctor` (required files, hooks,
stale library notes). Largely the logic now living in `packages/tokens/scripts/build.ts`
and the three hooks, lifted into a command that runs outside this repo.

**Done when:** `kit doctor` passes on jobpilot, and `kit check` fails a deliberately
introduced raw colour in a consumer project.

## 06 — `templates/` and `presets/`, then `/kickoff`

The files a new project gets, and the phased interview that writes them. First preset:
`next16-insforge`, from jobpilot.

**Done when:** a throwaway project goes from an empty folder to feature 01 merged using
only the kit — and every rough edge hit along the way has gone back in as a change here.

## 07 — `apps/site`

Marketing site. Design TBD.

**Done when:** it explains what groundwork is to someone who has never seen it.

## 08 — Registry site

The registry app stops being a single scrolling list and becomes a site: an illustrated
landing page, and real docs — sidebar grouped by tier, one page per item, source and
install on the page. Generated from `registry.json`, so adding an item adds a page.

**Done when:** someone who has never seen groundwork can land on `/`, understand what it
ships, and get from there to a working `shadcn add` for any item without being told how.

---

## Later

- GitHub Action opening update PRs when a version is published
- Visual regression screenshots per item and theme in CI
- A Vite preset (sensory-safari, wyatt); more themes
- Promote the vendored design skills into `skills/` once their licences are confirmed
  (`frontend-design` is Apache-2.0 and already clear; the `better-*` family carries no
  licence file)
