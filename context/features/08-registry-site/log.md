# Log — 08 Groundwork site

## The correction that reshaped the feature

The first build was a component-registry site: hero, tier groups, item pages. The
developer stopped it — groundwork bootstraps a project's skills, context and knowledge as
well as its design system, and the site described only the design system.

The miss was avoidable from inside the repo. `context/overview.md` opens with "the two
halves" and names the agent kit as one of them; `AGENTS.md` lists `skills/`, `knowledge/`
and `context/` in its map. The build worked from `AGENTS.md`'s one-line summary of the
registry instead of reading `context/overview.md` first. **Read the project's own overview
before designing anything that claims to describe the project.**

Second decision from the same conversation: `tracking-tight` on `body`, set in
`packages/tokens/base.css` so it reaches every groundwork project rather than this app
alone. Asked for as `tracking-tighter` (-0.05em) and revised to `tracking-tight`
(-0.025em) after seeing it.

## Evidence

- **Both halves are visible from `/`** — checked in the browser at 1470px, both themes.
  The landing runs plate → two halves → the loop as a numbered sequence → the `context/`
  tree → the component index. The `context/` tree is the section that makes "architecture
  before code" concrete; without it the claim is just a sentence.
- **Kit pages come from what the repo contains.** `app/_site/kit.ts` is the single source
  for the loop's stages and the `context/` tree, written from `skills/*/SKILL.md` and
  `context/features/README.md`. The landing page and `/docs/loop` render the same array,
  so they cannot drift into two descriptions of one thing.
- **23 item pages generated** — `next build` prerendered `/docs/components/[name]` for all
  23 (`● [+20 more paths]` after the three it names) plus six static pages. Not yet
  verified by adding a throwaway item and removing it, which is what the criterion asks
  for; the generation is from `registry.json` with no per-item file, so the risk is low
  but the check is still outstanding.
- **Item page content** — `/docs/components/button` checked in the browser: breadcrumb,
  title, description, the data plate (version 1.0.0 / Primitive / Minor and patch /
  1 file), live preview, install command, dependencies, source from `public/r/button.json`.
- **Hero legibility** — the plan's flat 55%/72% wash erased the illustration in dark. The
  layers were tuned live in the page and then written back: 46% wash in light, 50% in
  dark, a radial lift behind the words, and a bottom fade with late-weighted stops because
  a plain two-stop fade read as a hard edge. Checked in both themes.
- **Contract tokens only** — `bun run lint` clean with `no-raw-colors` over `app/**`. No
  rule disabled, no token added. The hero scrim is built from `--background` and the
  gradients live in `@utility` blocks in `globals.css`, which the rule does not police but
  which name only contract tokens.
- **`tracking-tight` reaches projects** — set on `body` in `packages/tokens/base.css`,
  which every project imports through the `setup` item. Visible on the registry's own
  component previews, since they render through the same stylesheet.
- **`bun run check`** — exit 0. Tokens generated and both themes validated, 16 lint-rule
  tests pass, eslint clean, registry build reports no item content change. `git status`
  after the build shows no modified file under `public/r/`, which is the check that this
  feature touched no registry item.
- **`bun run --filter registry build`** — clean. 32 pages prerendered.

## After review

`/review` (see `review.md`) found two critical issues, ten important ones and a run of
minor ones, and confirmed the three open criteria below were still open. The fixes, and
the checks that settled each criterion, all ran on 2026-09-13.

### Criteria, re-checked

- **Hero legibility, both themes.** Checked in the browser at 1440×900 with the new WebP,
  then **measured**, not eyeballed. A script drew the decoded illustration at the hero's
  `object-cover` geometry and rebuilt the layers from the live DOM (wash alpha read from the
  computed style: 0.46 light, 0.50 dark). It then took the WCAG ratio of each piece of text
  against every second pixel behind it. Worst pixel / mean:

  | | light | dark |
  | --- | --- | --- |
  | headline | 7.58 / 12.08 | 5.35 / 11.38 |
  | subhead (`foreground/80`) | 5.76 / 7.44 | 5.61 / 8.40 |
  | "See the components" (`foreground/80`) | 6.27 / 7.20 | 7.27 / 9.73 |
  | wordmark | 9.51 / 11.22 | 7.16 / 12.81 |

  The first pass failed: the dark wordmark was **3.6:1** over the brightest cloud. A
  `plate-top` layer, built from `--background` like the others, fixed it. The nav links
  and the header button sit on their own `bg-card` pills, so they weren't measured against
  the plate.
- **Kit pages describe what the repo contains.** Previously not met: `kit.ts` was a
  paraphrase and had already drifted ("Six commands… Five… three more"). Now
  `app/_site/repo.ts` reads everything at build time:
  - **The loop:** each skill's description comes from its `SKILL.md` frontmatter,
    `/feature finish` uses the first paragraph of its own section, and "writes" comes from
    the "(by)" column of `context/features/README.md`.
  - **The `context/` tree:** file names come from disk and the feature folder from the
    README.
  - **Knowledge:** every `knowledge/*.md` is listed with its real frontmatter, and the
    specimen is a committed file's frontmatter, not a copy.

  `kit.ts` keeps only the order, the headings and one note per top-level context file. The
  build fails if a skill in `skills/` isn't on the site, or a `context/*.md` has no note.
  Proven by adding `skills/zz-probe/` and removing it again:
  `app/_site/kit.ts is out of step with skills/: not on the site: zz-probe.`
- **Adding an item produces a page and a sidebar entry.** Added `zz-throwaway` to
  `registry.json` only (tier `lib`), then ran `registry:build`.
  - **Dev server:** `/docs/components/zz-throwaway` rendered its title, a plate reading
    0.0.1 / Library / Pinned / 1, the no-preview note, the install command and one source
    file. The sidebar's Libraries group gained "Throwaway check" with `aria-current="page"`.
  - **`next build`:** prerendered 33 pages instead of 32 ("+21 more paths" instead of +20).
  - **Tier guard:** setting its tier to `widget` failed the build with `registry.json:
    "zz-throwaway" has meta.tier "widget", which the site has no group for.`
  - **Cleanup:** `registry.json` was restored from a copy, the generated `public/r` files
    were removed, and `registry:build` was re-run. `git status` is clean on both.
- **Theme across a reload and a route change.** Browser, with the system colour scheme
  emulated **opposite** to the stored choice, so a pass can't come from the system default:
  - **Light over a dark system:** toggled to light (`gw-theme=light`), then a full reload:
    still light. A client-side navigation to `/docs#setup` (a window flag proved it wasn't
    a reload): still light.
  - **Dark over a light system:** toggled to dark, then reloaded: still dark.
  - **No icon flash:** the server HTML carries both icons (`dark:hidden` /
    `hidden dark:block`), so the first paint shows the right one with no hydration flash.
- **No horizontal scroll at 400px.** Previously argued statically; now checked. At a
  400×860 viewport, 30 pages were loaded and `documentElement.scrollWidth` read on each:
  `/`, all five docs pages, all 23 item pages, and an unknown item (the 404).
  - **The first run failed twice.** `/docs` was 466px wide: an implicit grid track inside
    the setup list's `<li>`. `/docs/components/pagination` was 432px: a non-wide preview
    panel with no horizontal overflow of its own.
  - **The fix:** `grid-cols-1` / `min-w-0` down the docs shell, and every preview panel is
    now `overflow-x-auto` with `justify-center-safe`, so an overflowing child isn't cut
    off on the left.
  - **Second run:** 30 of 30 at 400px.
- **The sidebar is reachable at 400px and marks the current item.** At 400px: opened
  "Browse the docs" and tapped Calendar. The list closed and the page loaded at
  `scrollY 0`, with Calendar marked current. The first version closed the list on the
  pathname change, which left the reader at `scrollY 735`, mid-page, because Next had
  already scrolled to where the page started under the open list. It now closes on the
  click.
- **The TOC marks the section in view.** On `/docs/tokens` at 1440px: top → names, the
  last screenful → rules, bottom → changing, scrolling back up into the names section →
  names. **One caveat on method:** at the time the browser pane had stopped rendering: a
  probe showed `requestAnimationFrame` not firing, and `scrollTo` fired no `scroll` event.
  Later in the session the same "hidden" pane rendered normally, so the stall comes and
  goes; see `knowledge/browser-verification.md`. So the page was scrolled for real and
  `scroll` was dispatched by hand, with `requestAnimationFrame` swapped for a 16ms timer. That exercises the real handler against real positions; only the event delivery
  was simulated. The check found a second bug: "The rules" could never be marked, because
  the last two sections both fit in the final screen and neither could reach a fixed
  reading line. The line now slides down over the last screenful.

- **Item page content, after the move to the shared `DocPage`.** Re-checked on the dev
  server, since the refactor came after the original check on `/docs/components/button`.
  - **`/docs/components/date-picker`:** plate Version 1.0.0 / Tier Pattern / Updates taken
    Patch only / Files 1, the description as the lead, 5 preview figures, the command
    `bunx shadcn@latest add @ja3dan/date-picker`, 1 source block, and dependency links to
    `/docs/components/{calendar,popover,dates,motion}` plus `date-range-picker` under
    "Used by".
  - **`/docs/components/dates`:** Tier "Library" and the no-visual-preview note.
- **`tracking-tight` reaches a registry component, and the setup item carries it.**
  - **On a preview:** computed `letter-spacing` on `/docs/components/date-picker` is
    `-0.4px` on `body` (16px × -0.025em) and the same `-0.4px`, inherited, on the button
    inside the preview figure.
  - **In the setup item:** the built `public/r/setup.json` contains
    `@import "@ja3dan/tokens/base.css"`, so every project initialised from it imports the
    rule.
  - **Not verified in a real consumer**, because `@ja3dan/tokens` isn't published
    (`npm view` → 404) and no project has installed it yet. "Reaches every groundwork
    project" is true of the setup item, not yet of an installed project.
- **`bun run check` passes, no rule disabled, no token added.** Re-ran after the fixes,
  exit 0: tokens and both themes validated, 16 lint-rule tests pass, eslint clean, 24 items
  versioned. `grep -rn eslint-disable apps/registry/app apps/registry/registry` → 0.
  `git diff main -- packages/tokens/contract.json packages/tokens/themes` → empty.
- **The registry build passes and reports no item content change.** The first
  `/feature finish` **refused here**: the branch carried `745f426` (data-table 1.0.1),
  so measured against `main` the criterion was false.
  - **The split:** that commit now lives on its own branch, `fix/data-table-widths`, for
    its own PR. 08 was rebuilt on `main` without it.
    `git diff --stat <rebuilt> <pre-split>` shows exactly the six files `745f426` touched
    (49+/8−).
  - **On the rebuilt branch:** `git diff main -- apps/registry/registry.json
    apps/registry/registry apps/registry/public/r` is empty. `bun run check` passes, with
    `registry:build` versioning 24 items and leaving `git status` clean, and `next build`
    → 32 pages.
  - **Outside `app/**`, not in the spec:** the feature reaches out in two places the spec
    didn't list: `scripts/version-registry.ts` (the shared `REGISTRY_URL` resolution) and
    `public/backgrounds/background.webp`.

### The other findings

- **The onboarding command** now resolves `REGISTRY_URL` the same way
  `scripts/version-registry.ts` does: env, else the Vercel production domain, else
  `localhost:3100`. The command on `/docs` and the URL written into `setup.json` can't
  name two hosts. It showed `http://localhost:3100/r/setup.json` on the dev server.
  `/docs` now also says plainly that `shadcn init` doesn't create skills, `context/` or
  knowledge.
- **The hero image** is now `background.webp`, 2560px at quality 70: **614 KB, down from
  9.0 MB**. It is still served through `next/image`, and was checked in both themes above.
  `spec.md` still names `background.png` in the criterion; the format changed, the
  criterion didn't. The spec commit that added the PNG was rewritten to add the WebP
  instead, so the 9 MB file is in no commit on this branch
  (`git rev-list --objects main..feat/08-registry-site | grep background.png` → none). The
  pre-split history is kept locally as `backup/08-before-split` and was never pushed.
- **"Librarie"** — tiers carry a `singular`.
- **Install needs setup first:** the item page says so and links to `/docs#setup`.
- **Item pages use the shared `DocPage`/`Section`**, so their TOC ids come from the same
  shell as every other docs page.
- **Minor fixes:**
  - The meta description covers both halves.
  - The theme toggle uses a fixed "Dark theme" label with `aria-pressed`.
  - The copy button shows a cross when the clipboard write fails.
  - There's a skip link and a `<main id="content">` on every page, and the landing footer
    sits outside `<main>`.
  - The tier breadcrumb links to `/#<tier>`.
  - The no-preview fallback no longer points at "above".
  - "Knowledge" is in the header nav.
  - There's an `app/not-found.tsx` with the site header.
  - The hero settles on load (`animate-in`, collapsed by reduced motion), so the plan's one
    motion moment exists and the CSS comment is true.
  - `type-display`/`type-section` `@apply font-heading` instead of re-implementing it.
  - `_site` files export at the bottom and share `FOCUS_RING`/`TEXT_LINK`.
  - The copy and theme buttons are the registry's own `Button`.
  - `Track` no longer allows `major`, and an item with a missing or unknown tier or track
    fails the build.
- **Scope:** 07 is marked on hold in `build-plan.md`, and root `AGENTS.md` describes
  `apps/registry` as the site.

### Left as they are, on purpose

- **`tracking-tight` also reaches mono figures and code blocks** (`tokens-review`, minor).
  The install commands looked fine at 400px; the source blocks and the table's mono figures
  were not examined closely. No override added. Worth a deliberate look.
- **The kit pages read `../../skills` etc. at build time.** That works locally and in any
  build that has the whole repo checked out. On Vercel it depends on "Include files outside
  the root directory" staying on, which is the default for monorepos. Not yet confirmed on
  a deploy; a build without those files fails loudly rather than rendering empty pages.
- **`@ja3dan/tokens` has no version bump for the `base.css` change.** The package isn't on
  npm (`npm view` → 404), so no consumer can pick it up unannounced. The first publish
  should include it deliberately.
- **Every item page ships the JS for every example set** (`Examples` is one client
  module). A performance cleanup, not a correctness one; splitting it per item is its own
  change.

## Not verified

Nothing in `spec.md` is left without a check above. One thing is only partly direct: the
TOC's scroll events were dispatched by hand, because the browser pane was hidden (see
above).
