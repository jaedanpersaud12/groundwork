# Review — 08 Registry Site

_Reviewed 2026-09-13 against spec.md and plan.md._

Three passes. A fresh-eyes reviewer saw only the spec, plan, log, diff and rules. The
`tokens-review` subagent covered the `base.css` change and the `registry-review` subagent
covered the registry tree. Before any of them ran, these all passed: `bun run check`,
`tsc --noEmit`, `next build` (32 static pages) and `registry:build` (tree clean
afterwards). The Critical findings, the "Librarie" label and the "Six commands" copy were
all confirmed against the source.

## Layer 1 — Spec alignment
**ISSUES**

- [ ] "`/` renders the hero with `background.png` through `next/image`, and the headline, subhead and nav read against the plate in both light and dark, checked in the browser" — The `next/image` part is met (`page.tsx:15-23`). Legibility is only claimed: there is no screenshot and no contrast figure, and the plan's ~6.7:1 was measured on a wash that was later dropped.
- [x] "The landing page and the docs cover both halves" — Hero copy (`page.tsx:37-44`), "Two halves" (`:62-91`), the loop (`:93-122`), the `context/` tree (`:124-143`), and `/docs` (`docs/page.tsx:37-66`).
- [ ] "`/docs/loop`, `/docs/context` and `/docs/knowledge` each describe their part of the kit from what the repo actually contains, not from a paraphrase that can drift" — **Not met.** `_site/kit.ts:15-121` is a hand-written paraphrase of the skills, and the knowledge frontmatter is hardcoded (`docs/knowledge/page.tsx:17-22`). It has already drifted: `docs/loop/page.tsx:22` says "Six commands… Five… three more", and the `context/` tree shows `04-kit-sync/`, which isn't on this branch.
- [ ] "Every one of the 23 items has a page… adding an item produces a page and a sidebar entry with no other file edited — verified by adding a throwaway item and removing it again" — The generation is real (`generateStaticParams`, sidebar built from `groups`). The throwaway-item check was never run; log.md marks it **Open**.
- [x] "An item page shows its tier, published version from `versions.json`, track, description, live preview or fallback, the add command, and registry dependencies as links" — All present (`registry.ts:57`, `[name]/page.tsx:67-111`). The tier label is wrong for libraries (see Important).
- [x] "An item page shows the item's source, taken from `public/r/<name>.json`" — `registry.ts:92-100`, rendered at `[name]/page.tsx:137-148`.
- [ ] "The sidebar groups by tier, marks the current item, and is reachable at 400px" — Grouping and `aria-current` are in the code, and there's a `<details>` fallback below `lg`. Never checked at 400px.
- [ ] "The right-hand TOC lists that page's sections and marks the one in view" — The code exists (`toc.tsx`), but the log never mentions checking it, and the active-section logic looks wrong when scrolling up (see Important).
- [ ] "The theme choice survives a full page reload and a route change" — Unverified; log.md marks it **Open**.
- [ ] "No horizontal scroll at 400px on `/`, `/docs`, and an item page with a wide preview" — Unverified; log.md marks it **Open**, and the audit was static only. Reading the code points to a likely grid blowout on wide previews.
- [x] "`tracking-tight` reaches every groundwork project — set in `packages/tokens/base.css`, and visible on a registry component's own preview" — Set at `base.css:14`. `@ja3dan/tokens` is not on npm yet, so "reaches every project" means once it publishes.
- [x] "`bun run check` passes, no rule disabled, no token added" — Passes, there are no `eslint-disable` comments, and `contract.json` is untouched.
- [x] "`bun run --filter registry build` passes, and `registry:build` reports no item content change (this feature touches `app/**` only)" — True of the feature commit `bd47d9c`, but the branch also carries `745f426` (data-table 1.0.1). See Important.

**Planned but missing:** the hero-settle motion moment. `globals.css:84-88` still has a comment describing it.

**Built but not planned:** the data-table 1.0.1 commit, and notes about `feat/04-kit-sync` in `progress.md`.

## Layer 2 — System integrity
**ISSUES**

Root invariants, one by one:
- Generated files not hand-edited: **pass.**
- Contract tokens only: **pass.** The `color-mix(var(--background))` in the `plate-*` utilities stays inside the contract.
- Themes complete: **pass.**
- A content change bumps the version and commits `public/r/v/*`: **pass.** data-table went 1.0.0 → 1.0.1 and the merge base is committed.
- Registry import paths: **pass.**

Folder rules:
- `packages/tokens`: `tokens-review` had never run on `base.css`. **It has now run (this review):** nothing Critical, one Important point (see below).
- `apps/registry`: `registry-review` had never run on `745f426`. **It has now run:** clean. The patch bump is the right size, built output matches source, and all 20 items with markup still have examples.

Patterns:
- `type-display` and `type-section` (`globals.css:34-49`) re-implement the `font-heading` mapping from `theme.css:60`.
- The site hand-rolls its buttons, where the deleted `app/theme-toggle.tsx` used the registry's own `Button`.
- `standards.md`: no bottom `export { … }` in the new `_site` files, and the focus-ring class string is repeated about 20 times.

Scope: 08's build-plan "done when" (`build-plan.md:75-77`) nearly repeats 07's (`:66`). Root `AGENTS.md` still calls `apps/registry` a "preview/docs app".

## Layer 3 — Production readiness
**ISSUES**

- The setup command on `/docs` copies a placeholder URL.
- The 9 MB hero PNG is committed and served raw.
- No `app/not-found.tsx`, so a bad component URL gets Next's bare 404.
- Theme toggle icon flashes on first paint in dark mode.
- No `<main>` landmark or skip link on docs pages.
- The mobile sidebar `<details>` stays open after navigating.
- 400px is unverified, with a probable overflow on wide previews.

## Findings

### Critical — breaks something, or will
1. **The onboarding command can't work.** `apps/registry/app/docs/page.tsx:21,79`. `REGISTRY_URL = "https://<your-registry-domain>"` is rendered inside a copyable `shadcn init`. The build-plan's "get to a working `shadcn add` without being told how" fails at step one. `scripts/version-registry.ts:27` already reads `process.env.REGISTRY_URL`; the page could use the same source.
2. **9 MB PNG in `public/`.** `apps/registry/public/backgrounds/background.png` is 2912×1632 and was added in `704f9a7`. Once on `main` it lives in history for good and bloats every clone. It is also reachable unoptimised at its public path, and every cold optimiser run decodes it. Compress it (WebP/AVIF, or a smaller PNG) before merge. After merge it can't be undone without rewriting history.

### Important — should be fixed before merge
1. **Four criteria have no evidence, and a fifth was never mentioned.** No evidence: hero legibility, theme across reload and route change, 400px, and the throwaway item. Never mentioned: the TOC. `/feature finish` should refuse as things stand.
2. **Criterion 3 not met: the kit docs are a paraphrase that has already drifted.** `_site/kit.ts:15-121`, `docs/knowledge/page.tsx:17-22`, and `docs/loop/page.tsx:22` ("Six… Five… three more").
3. **"Librarie".** `docs/components/[name]/page.tsx:73`. `group.title.replace(/s$/, "")` mangles the `dates` and `motion` pages. The singular belongs in `TIERS`.
4. **The item page's add command assumes setup already ran.** `[name]/page.tsx:88`. A visitor who lands on a component page directly gets an unknown-registry error with no pointer to `/docs`.
5. **Likely grid blowout on wide previews.** `[name]/page.tsx:22` with `examples/index.tsx:52-55`. `overflow-x-auto` inside nested grid items with `min-width:auto` lets the data-table's width push the column out. This is probable at 400px and possibly at `xl`. Try `min-w-0` or `grid-cols-1`.
6. **The TOC sticks on the later section when scrolling up.** `_site/toc.tsx:23-30`. It only updates when a heading enters the top band.
7. **The mobile sidebar stays open across navigation.** `_site/sidebar.tsx:53`. The `<details>` lives in the persistent layout.
8. **The data-table 1.0.1 commit rides in this PR.** `745f426`, against the spec's own "not this one" and criterion 13's "`app/**` only". `registry-review` found it clean, so this is about scope, not correctness: split it out or note it in the log.
9. **07 and 08 now overlap.** `context/build-plan.md:62-77`. The landing page already does 07's job. Re-scope or drop 07 and update root `AGENTS.md`, or the same page gets built twice.
10. **`base.css` changes every consumer with no version signal** (from `tokens-review`). `packages/tokens/base.css:14`, package still at `0.1.0`. Not urgent while `@ja3dan/tokens` is unpublished (checked: 404 on npm), but the first publish should include it deliberately.

### Minor — worth knowing
- `tracking-tight` also reaches the `font-mono tabular-nums` figures in `table-card.tsx:213`, `progress-meter.tsx:50` and `applications-table.tsx:266,273`, plus code blocks. Worth a look in the preview (from `tokens-review`).
- `_site/registry.ts:8`: `Track` allows `"major"`, which the registry rules don't (from `registry-review`).
- `_site/registry.ts:55`: an item without `meta.tier` silently becomes "lib", and an unknown tier gets a page but no sidebar entry.
- `app/layout.tsx:26-27`: the meta description only mentions the design system.
- `_site/theme-toggle.tsx:22`: the server snapshot is always light, so the icon flashes in dark mode.
- `_site/theme-toggle.tsx:41-42`: `aria-pressed` plus a flipping label announces contradictory state.
- `_site/copy-button.tsx:21`: a clipboard failure is swallowed silently.
- `docs/layout.tsx:27-32`: no `<main>` or skip link. On `/` the footer sits inside `<main>` (`page.tsx:179`).
- `[name]/page.tsx:55`: the tier breadcrumb links to `/docs`, not the tier.
- `[name]/page.tsx:83`: the fallback says "the blocks and patterns above", but "Used by" is below it.
- `[name]/page.tsx:20-29`: a local `Section` duplicates `prose.tsx`'s `DocPage`/`Section`.
- `[name]/page.tsx:5`: every item page ships every example set's JS.
- `_site/header.tsx:7-12`: "Knowledge" is missing from the nav, and the nav is hidden below `md`.
- No `app/not-found.tsx`.
- `globals.css:84-88`: a comment for an animation that doesn't exist.
- `context/progress.md:6`: "spec written, needs /architect" is stale.
