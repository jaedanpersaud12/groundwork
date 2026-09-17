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

## 03 — A first consuming project

Swap an existing app's local copies for installed registry items; write its `kit.lock.json`.

*Already in that app, and relevant here:* a `skills-lock.json` (`version: 1`; per skill
`source`, `sourceType: "github"`, `skillPath`, `computedHash`) from installing skills out of
`JavaScript-Mastery-Pro/jsm-agent-skill` and `jakubkrehel/skills`. 04 decides whether
`kit.lock.json` absorbs it or sits beside it; 03 lives with the result, and 09 installs
skills against it. And its 426-line
`ui-tokens.md` is what the token contract replaces.

**Done when:** the app's key screens match in screenshots before and after, and its
typecheck and lint are clean.

## 04 — `packages/kit`: sync engine

`kit sync status | update`, `kit link`. The 3-way merge against `public/r/v/*`.

*Before fixing the `kit.lock.json` schema:* the 03 app already has a lock of the same shape for
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

**Done when:** `kit doctor` passes on the 03 app, and `kit check` fails a deliberately
introduced raw colour in a consumer project.

## 06 — `/kickoff` prompts, and `templates/`

Three plain-markdown prompts that interview someone and write `project-overview.md`,
`architecture.md` and `build-plan.md`, plus the template files a new project copies. No
tool access assumed — they work in any LLM, which is what keeps the kit's value from being
locked behind installing the kit. First preset: `next16-insforge`, from an existing app.

**Done when:** running the three prompts against an existing app, answering as its developer
would, produces context that survives a line-by-line diff against that app's real files on
the checks in `context/features/06-kickoff/spec.md`.

The measurement this rests on: that app's `context/` is 3,774 lines, of which about 1,300
can be generated at kickoff — the rest is copied, replaced by the token contract, written
during the build, or read out of installed packages. Settled first, before anything else
was written: does stage 2 hold its schema section at ~580 lines? It did.

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
off the "Later" list — see that section's old note for the precedent this adapts.

**Not a port.** The upstream `imprint` (from `jsm-agent-skill`) captures raw Tailwind
classes (`bg-`, `rounded-`, `text-`) because the project it served had no token contract — every class
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

## 11 — Show, don't tell: the landing page

Not a redesign. The site's engineering is sound — an audit at 400px across eight routes in
both themes found no overflow and no theme fault — and the brand is deliberate: dark-first,
one purple accent, a pill CTA, an illustrated hero with four overlay plates measured against
the illustration's own pixels. None of that changes.

What is weak is the ratio of description to evidence. `/` already has one section that
cannot lie: the `context/` tree is generated from the repo at build time. The sections on
either side of it fall back to bullet lists that any project could have written — "fails the
build on a hex, an arbitrary colour or a palette class" is a claim where the actual
`no-raw-colors` message would be proof, and costs more words to be less convincing.

Also fixes a live factual error: `/docs` still tells the reader that the automated half
(`kit init`) does not exist. It has since 09.

**Narrowed during the build to the landing page only.** `/docs` is a second pass, so the two
findings that belong to it are held in `context/features/11-show-not-tell/spec.md`'s
out-of-scope section: `/docs` still states that `kit init` does not exist (false since 09),
and it renders the same `HALVES` data the landing page has now stopped using.

**Done when:** the "Two halves" section on `/` renders real artefacts read off disk at build
time — frontmatter from a real `skills/*/SKILL.md`, the verbatim message string from
`packages/eslint-plugin`'s own rule metadata — so that changing either source changes the
site and deleting it fails the build; the rendered word count for `/` is lower than the
pre-change number recorded in the feature log; below-the-fold sections fade in once on
scroll entry and sit fully visible under `prefers-reduced-motion`, with JavaScript off, and
when the page's own JavaScript fails to run; and the diff touches no token, font, icon
library or colour.

## 12 — Docs refresh, starting with setup

The landing page now sends people to `/docs`, which still opens with a wall of prose, only
sets up the design system, and says `kit init` does not exist. This rebuilds the docs shell
and turns `/docs` into the setup guide: the whole kit (`create-next-app`, `kit init`, the
kickoff prompts, the checks, the first feature) or only the design system.

**Done when:** `/docs` documents both paths with every command in run order, sourced from the
kit's CLI and init.ts; no docs page calls `kit init` unbuilt; the shared docs shell is rebuilt;
no overflow from 320 to 1920px; checks pass.


## 13 — App UI doctrine

The registry gives a project parts; nothing tells it what an app screen *is*. A production CMS
settled that the hard way — sidebar shell, instant navigation into skeletons, fixed-height
paged tables, icon row menus, CRUD in modals, stat strips — and every new project re-decides
it worse. This writes the rules down where every project's agent reads them: a shippable
`app-ui` skill, referenced from `/architect`, `/review`, `/feature start` and `/imprint`, and
from the template's `ui-rules.md`.

**Done when:** `skills/app-ui/SKILL.md` covers shell, page header, navigation/loading,
radii/depth, tables, row actions, modals, loading buttons, stats/panels, value pickers,
motion and copy, each with concrete values traceable to the reference CMS's source; architect, review,
feature and imprint reference it; `kit init` into a throwaway project installs it; the site
lists it; `bun run check` passes.

## 14 — Tokens: three named radii and nav tints

`rounded-chip` 4px / `rounded-control` 6px / `rounded-surface` 10px with the stock
`rounded-xs…4xl` folded onto them, and optional `nav-1…8` tint tokens (light + dark) for the
sidebar. Existing registry items move onto the named radii (version bumps).

**Done when:** `contract.json` declares both; `bun run tokens` generates them and validates
every theme; TOKENS.md documents what each radius sits on; every registry item uses the
named radii; `registry:build` passes with bumped versions.

## 15 — Dropdown, menu, dialog, alert dialog

`@ja3dan/dropdown` (`Dropdown` listbox + `DropdownMenu` actions with icons, destructive and
separated items; portalled, fixed, flipping, travelling highlight) and `@ja3dan/dialog` /
`@ja3dan/alert-dialog` (sizes default/lg/full, media slot) on Base UI, contract tokens only.
The data-table block's row actions move to the menu and its edits to a dialog.

**Done when:** each item installs into a blank app and passes `no-raw-colors`; keyboard
(arrows, Home/End, Enter, Escape, typeahead where the source has it) and focus return
verified in a browser; menu isn't clipped inside a `TableCard`; examples on the docs page.

## 16 — App shell

`@ja3dan/app-shell`: sidebar (icon rail collapse, cookie, ⌘B with `data-instant`, per-row
tints, grouped nav from data with permission trimming), sticky header, sticky `PageHeader`,
`Preamble`, and an error boundary pattern.

**Done when:** a throwaway app using the block matches `app-ui` §1–3 values; collapse
animates as one piece and the shortcut toggles instantly; mobile sheet works; no layout
shift between short and long pages.

## 17 — Figures and controls

`@ja3dan/stats` (`StatStrip`, `Stat`, `Delta`, `Panel`, `PanelHeader`, `BarList`,
`toBars`, `TabbedPanel`), `@ja3dan/segmented`, `@ja3dan/tabs`, `@ja3dan/loading-button`.

**Done when:** stat tiles are pixel-identical in height with and without delta/hint; loading
button never changes width across its four states; tabs and segmented are keyboard-operable
with correct roles; examples on the docs page.

## 18 — Skeletons and fixed-height tables

`@ja3dan/skeleton` (Bar, Block, LoadingScreen, PageHeader/StatStrip/Panel/Table/Toolbar/
CardGrid skeletons reusing the real containers) and `@ja3dan/table-pager` (`usePaged`,
`PadRows`, `TablePager`); `TableCard` density and fixed columns confirmed; the data-table
block adopts all of it and ships a `loading.tsx` example.

**Done when:** in a throwaway app, navigating to a slow route shows the skeleton immediately
and content replaces it with no layout shift (measured); a table is the same height on a
full page, a short last page and an empty filter.

---

## Later

- GitHub Action opening update PRs when a version is published
- Visual regression screenshots per item and theme in CI
- A Vite preset; more themes
- Promote the vendored design skills into `skills/` once their licences are confirmed
  (`frontend-design` is Apache-2.0 and already clear; the `better-*` family carries no
  licence file)
