# Plan — 08 Registry site

## The constraint that shapes everything

`no-raw-colors` runs over `app/**`. The colour axis is therefore **not free**: it is
jobpilot's theme and nothing else. Ground `--background`, ink `--foreground`, plate
`--card`, rule `--border`, signal `--primary` (violet), and the three quiet text tokens.

Two consequences worth stating before any markup:

- **The hero scrim is built from `--background`, not from black or white.** A wash of
  `bg-background/55` (light) / `bg-background/72` (dark) over the illustration, plus a
  gradient `from-transparent to-background` on the bottom two-fifths so the plate
  dissolves into the page. Composited against the illustration's extremes this puts
  `--foreground` at ~6.7:1 over the darkest region in light and ~6.5:1 over the brightest
  in dark. To be confirmed in the browser, not trusted from arithmetic.
- **The sidebar cannot use `--sidebar*`.** Those tokens are `required: false` and jobpilot
  never defines them, so `bg-sidebar` resolves to nothing. The sidebar is built from
  `--background` and `--border` like any other surface.

## Type

The one axis the brief leaves open, so it carries the personality.

- **Archivo**, variable, both display and body. The **width axis is the treatment**: the
  headline sets at `wdth` ~112 and weight 620, semi-expanded like a park-service sign;
  body sets at normal width and 400. One family, two clearly different voices — and it
  replaces Geist, which is the default every Next app already wears.
- **IBM Plex Mono** for code, install commands, filenames and item slugs — strings a
  person literally types. Not for labels, captions or version numbers used as prose.

`--typeface-heading` already exists in the contract as an optional token that themes may
set, and `theme.css` already exposes it as `font-heading`. Setting it in the app's
`globals.css` is the intended usage, not a contract change.

## Layout

### `/` — three movements

```
┌─────────────────────────────────────────────────────────────┐
│ groundwork   [ Start here  Tiers  Tokens  Rules ]  [Browse] │  pill nav, floating
│                                                             │
│                                                             │
│              Start every project on                         │  Archivo semi-expanded
│                  the same ground                            │  centred, ~clamp(2.5,6vw,5rem)
│                                                             │
│        Twenty-four components you copy into your            │
│        project, one token contract they all obey…           │
│                                                             │
│                 [ Browse the components ]                   │  white pill, as the reference
│                                                             │
│  ░░░░  illustration, washed, fading to page ground  ░░░░░░  │
├─────────────────────────────────────────────────────────────┤
│  What ships          three hairline-ruled rows, not cards   │
│  ─────────────────────────────────────────────────────────  │
│  Tokens       the contract every component obeys   npm      │
│  Components   copied into your project, yours to   shadcn   │
│  Lint rule    fails the build on a raw colour      npm      │
├─────────────────────────────────────────────────────────────┤
│  The index           all 24 items, grouped by tier          │
│  ─────────────────────────────────────────────────────────  │
│  Blocks                                                     │
│   data-table      A sortable, filterable…          1.0.1    │
│  Primitives                                                 │
│   button          …                                1.0.0    │
└─────────────────────────────────────────────────────────────┘
```

The third movement is the deliberate refusal: the obvious build is three feature cards
and a "view all" button. The index table is the single most useful thing the page can
carry — it is what you actually came for — and it is not a card grid.

### `/docs/[name]`

```
┌──────────┬────────────────────────────────┬──────────┐
│ sidebar  │ Primitives / Button            │ On this  │
│ 14rem    │                                │ page     │
│          │ Button                         │ 12rem    │
│ Start    │ The base control every pattern…│  Preview │
│  here    │                                │  Install │
│          │ ┌──────┬────────┬────────────┐ │  Source  │
│ Blocks   │ │Version│ Tier  │ Tracks     │ │          │
│  Data…   │ │1.0.0  │Primitive│ minor    │ │          │
│ Patterns │ └──────┴────────┴────────────┘ │          │
│  …       │        the data plate          │          │
│ Primitives│                               │          │
│  Button ◀│ ┌────────────────────────────┐ │          │
│  Input   │ │      live preview          │ │          │
│  …       │ └────────────────────────────┘ │          │
│ Hooks    │ Install                        │          │
│ Libraries│  bunx shadcn@latest add …  [⧉] │          │
│          │ Depends on  → links            │          │
│          │ Source   button.tsx            │          │
└──────────┴────────────────────────────────┴──────────┘
```

The metadata is a **data plate** — labelled cells with hairline dividers — rather than
`@ja3dan/button · v1.0.0 · tracks minor`, which is what the page does today and which
reads as chrome. Same facts, structurally encoded, and "tracks minor" finally gets a
label explaining it.

## Principles

1. **One loud thing.** The plate is it. Everything below is quiet, dense, left-aligned,
   hairline-ruled. No second hero.
2. **Structure is data.** Tier groups, the data plate, the dependency links are all real
   information. No decorative dividers, no numbered markers except on the setup steps,
   which genuinely are a sequence.
3. **Signal is rationed.** `--primary` appears on links, the current sidebar item, and
   focus rings. Never as a gradient, never as decoration.
4. **One motion moment.** The hero settles on load. Nothing animates on scroll, no hover
   lift on every row.

## Files

```
app/layout.tsx            fonts, theme script, metadata
app/globals.css           --typeface-heading, hero utilities
app/page.tsx              landing
app/docs/layout.tsx       sidebar + TOC shell
app/docs/page.tsx         start here: setup, tiers, tokens, rules
app/docs/[name]/page.tsx  item page + generateStaticParams
app/_site/registry.ts     data access — items, tiers, versions, source from public/r
app/_site/*.tsx           nav, sidebar, toc, code-block, copy-button, data-plate
```

`app/_site/` is underscore-prefixed so Next never routes it.

## How to build it

1. Fonts and theme persistence in `layout.tsx` + `globals.css`; confirm `font-heading`
   resolves and the dark class survives a reload.
2. `app/_site/registry.ts` — one place that reads `registry.json`, `versions.json` and
   `public/r/<name>.json`. Everything else consumes it.
3. `/docs` shell: sidebar, then the item route with `generateStaticParams`. Get all 24
   pages existing before any of them look good.
4. Item page content: plate, preview, install, dependencies, source.
5. The landing plate, and the two movements below it.
6. TOC last — it needs the finished section headings to observe.
7. Browser pass in both themes at 1440 and 400; then `bun run check` and the build.

## Out of scope

As `spec.md`. Worth restating one: **no registry item changes.** If a preview looks wrong
at some width, that is a finding for a separate commit under the `registry-item` skill,
not a fix smuggled into a site feature.


---

## Correction, mid-build

The plan above designed a component-registry site, and the build followed it. That was the
wrong subject: groundwork bootstraps a project's skills, context and knowledge as well as
its design system, and a site showing only the registry misrepresents it.

What changed:

- **`app/_site/kit.ts`** holds the kit's content — the loop's stages, the `context/` tree,
  the two halves — in one place, so the landing page and the docs pages cannot drift into
  describing the loop two different ways.
- **Routes.** Registry items moved to `/docs/components/[name]`, which frees `/docs/*` for
  `loop`, `context`, `knowledge` and `tokens` without a static segment shadowing an item
  name. The sidebar leads with the kit; component tiers follow it.
- **The landing page** gained the two halves, the loop as a numbered sequence — it is a
  genuine sequence, which is the only thing that justifies numbering it — and the
  `context/` scaffold rendered as a file tree. The tree is the section that makes
  "architecture before code" concrete rather than a claim.
- **`tracking-tight` on `body` in `packages/tokens/base.css`**, so the tighter setting
  reaches every groundwork project rather than only this app.

The hero's three-layer scrim came out of the browser pass, not out of this plan's
arithmetic: 46% wash in light and 50% in dark, a radial lift behind the words, and a
late-weighted bottom fade. The flat 55/72 the plan proposed erased the illustration in
dark.
