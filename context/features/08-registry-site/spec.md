# 08 — Groundwork site

## What

`apps/registry` stops being one scrolling page of components and becomes the site for
**groundwork**, both halves of it:

- **`/`** — an illustrated landing page built on `public/backgrounds/background.png`.
  Below the plate: the two halves, the loop a feature passes through, the `context/`
  scaffold a new repo starts with, and the component index.
- **`/docs`** — start here. The two halves, the setup commands, and where to go next.
- **`/docs/loop`** · **`/docs/context`** · **`/docs/knowledge`** — the agent kit: the six
  lifecycle commands, the architecture a project writes down before it writes code, and
  the harvested gotchas.
- **`/docs/tokens`** — the contract, generated from `contract.json` so it cannot drift.
- **`/docs/components/[name]`** — one page per registry item. Live preview, install,
  source, dependencies. Generated from `registry.json`, so adding an item adds a page.

A persistent sidebar carries the kit first and the component tiers after it; a right-hand
table of contents tracks position within a page.

## Why

**The first version of this feature got the subject wrong, and that is worth recording.**
It built a component-registry site: hero, tier groups, item pages, nothing else. But
groundwork is a project bootstrapper — the skills an agent works from, the `context/`
scaffold that means a repo's architecture exists before its code does, and the knowledge
base that stops the second project paying for the first project's lessons. The design
system is one half. A site that shows only the registry describes a design system that
happens to have some docs, which is not what this is.

The single page it replaces had every preview mounting at once, nothing linkable except by
anchor, and nowhere to put what an item needs to actually be used — its source, what it
pulls in, which version you are getting.

It is also the only app in the repo that consumes the token contract the way a real
project does. A site with a hero, a sidebar, code blocks and a busy illustrated plate
exercises far more of the contract than a list of cards does — anywhere the contract can't
express the design is a finding about the contract.

## Decisions taken before the spec

- **Landing plus routes, not one page restyled.** Chosen over an anchor-based single page:
  the docs shape is the point, and per-item pages are what make the sidebar and the TOC
  mean anything.
- **Contract tokens only, including the hero.** `no-raw-colors` already runs over
  `app/**`. Text over a vivid illustration is exactly the case that tempts a `text-white`,
  so the scrim is built from `--background` and the type from `--foreground`. If that
  turns out to be impossible rather than merely hard, it is a `/harvest`, not an
  eslint-disable.
- **Source comes from `public/r/<name>.json`, not the filesystem.** The built item JSON
  already carries the file contents, and it is what a consumer actually receives. Reading
  `registry/groundwork/**` directly would show source that hasn't been published yet.
- **No search.** ⌘K over 23 items is furniture. Revisit at 60.

- **Tracking belongs to the foundation, not to this app.** `tracking-tight` is set on
  `body` in `packages/tokens/base.css`, which every project imports via the setup item —
  so a registry component dropped into any groundwork project sits on the same rhythm as
  the text around it. This takes the feature outside `apps/registry` by one line, into a
  published package. Deliberate, and called out here because the spec otherwise says this
  feature touches `app/**` only.

## Done when

- [ ] `/` renders the hero with `background.png` through `next/image`, and the headline,
      subhead and nav read against the plate in **both** light and dark — checked in the
      browser, not assumed
- [ ] The landing page and the docs cover **both halves** — a reader who has never seen
      groundwork can tell from `/` alone that it installs skills and a context scaffold,
      not only components
- [ ] `/docs/loop`, `/docs/context` and `/docs/knowledge` each describe their part of the
      kit from what the repo actually contains, not from a paraphrase that can drift
- [ ] Every one of the 23 items in `registry.json` has a page at `/docs/components/<name>`,
      and adding an item to `registry.json` produces a page and a sidebar entry with no
      other file edited — verified by adding a throwaway item and removing it again
- [ ] An item page shows its tier, published version from `versions.json`, track, the
      description, the live preview (or the "no visual preview" note for libs and hooks),
      the `bunx shadcn@latest add @ja3dan/<name>` command, and its registry dependencies
      as links to their own pages
- [ ] An item page shows the item's source, taken from `public/r/<name>.json`
- [ ] The sidebar groups by tier, marks the current item, and is reachable at 400px width
- [ ] The right-hand TOC lists that page's sections and marks the one in view
- [ ] The theme choice survives a full page reload and a route change
- [ ] No horizontal scroll at 400px on `/`, `/docs`, and an item page with a wide preview
- [ ] `tracking-tight` reaches every groundwork project, not just this app — set in
      `packages/tokens/base.css`, and visible on a registry component's own preview
- [ ] `bun run check` passes — `no-raw-colors` over `app/**` included, with no rule
      disabled and no token added to the contract purely to make the hero work
- [ ] `bun run --filter registry build` passes, and `registry:build` reports no item
      content change (this feature touches `app/**` only)

## Out of scope

- **Prop tables.** interior.dev has them; they need TS AST extraction from each item, and
  that is its own feature.
- **Search / ⌘K.**
- **MDX.** Item copy lives in `registry.json` where the build can see it; a second prose
  source would drift from it.
- **Changing any registry item.** If the site reveals a component bug, it gets its own
  commit under the `registry-item` skill, not this one.
- **New themes, or new tokens.** The design works within the contract as it stands. The
  one change to `packages/tokens` is the `body` tracking above; no token was added,
  renamed or revalued.
- **`apps/site`** — feature 07 is still a separate marketing site.
