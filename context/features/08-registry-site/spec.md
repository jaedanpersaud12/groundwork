# 08 — Registry site

## What

`apps/registry` stops being one scrolling page of 24 items and becomes a site:

- **`/`** — an illustrated landing page built on `public/backgrounds/background.png`:
  full-bleed plate, pill nav, one headline, one call to action. Below the fold, what
  groundwork actually ships and a way into each tier.
- **`/docs`** — start here. Init, the two install commands, and the tier taxonomy that
  explains why there are blocks, patterns, primitives, hooks and libs rather than a flat
  list.
- **`/docs/[name]`** — one page per registry item. Live preview, install, source,
  dependencies. Generated from `registry.json`, so adding an item adds a page.

A persistent sidebar groups items by tier; a right-hand table of contents tracks position
within a page.

## Why

The single page has 24 items on it and every preview mounts at once. Nothing is
linkable except by anchor, the setup instructions are buried above a wall of components,
and there is nowhere to put the things an item needs to be *used* — its source, what it
pulls in, which version you are getting. The registry is the thing groundwork sells to its
own future projects, and right now it reads like a scratch file.

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
- **No search.** ⌘K over 24 items is furniture. Revisit at 60.

## Done when

- [ ] `/` renders the hero with `background.png` through `next/image`, and the headline,
      subhead and nav read against the plate in **both** light and dark — checked in the
      browser, not assumed
- [ ] Every one of the 24 items in `registry.json` has a page at `/docs/<name>`, and
      adding an item to `registry.json` produces a page and a sidebar entry with no other
      file edited — verified by adding a throwaway item and removing it again
- [ ] An item page shows its tier, published version from `versions.json`, track, the
      description, the live preview (or the "no visual preview" note for libs and hooks),
      the `bunx shadcn@latest add @ja3dan/<name>` command, and its registry dependencies
      as links to their own pages
- [ ] An item page shows the item's source, taken from `public/r/<name>.json`
- [ ] The sidebar groups by tier, marks the current item, and is reachable at 400px width
- [ ] The right-hand TOC lists that page's sections and marks the one in view
- [ ] The theme choice survives a full page reload and a route change
- [ ] No horizontal scroll at 400px on `/`, `/docs`, and an item page with a wide preview
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
- **New themes, or new tokens.** The design works within the contract as it stands.
- **`apps/site`** — feature 07 is still a separate marketing site.
