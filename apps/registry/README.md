# 🧩 Registry & site

The groundwork site at **[gw.jaedan.me](https://gw.jaedan.me)**, and the shadcn registry
`@ja3dan` it serves. One Next 16 app, two jobs.

| Tree | What it is |
| --- | --- |
| `registry/groundwork/**` | 📦 **Shipped.** Copied into other people's projects by `shadcn add`. |
| `app/**` | 🌐 **The site.** Never installed anywhere. |

## Install a component

In a project set up with [`setup.json`](https://gw.jaedan.me/r/setup.json):

```bash
bunx shadcn@latest add @ja3dan/data-table
```

## What's in the registry

| Tier | Items |
| --- | --- |
| **Block** | `data-table` |
| **Pattern** | `sortable-table-head` `pagination` `filter-chip` `date-picker` `date-range-picker` |
| **Primitive** | `button` `input` `input-group` `textarea` `label` `checkbox` `popover` `status-pill` `progress-meter` `view-toggle` `table-card` `table` `empty-state` `calendar` |
| **Hook** | `use-data-table` |
| **Library** | `dates` `motion` |

Plus `setup`, which configures a project rather than adding a component. Every item has a
page at `/docs/components/<name>` with a live preview, its source and what it depends on.

## 🌐 The site

| Route | |
| --- | --- |
| `/` | Landing page: the two halves, the loop, the `context/` scaffold, the component index |
| `/docs` | Start here — setup commands and where to go next |
| `/docs/loop` · `/docs/context` · `/docs/knowledge` | The agent kit, **read from `skills/`, `context/` and `knowledge/` at build time** |
| `/docs/tokens` | The contract, generated from `contract.json` |
| `/docs/components/[name]` | One page per item, generated from `registry.json` |

Nothing on the site restates the repo by hand. Adding a skill without giving it a place in
`app/_site/kit.ts`, or an item with a tier the site doesn't know, **fails the build**.

## 🛠️ Develop

```bash
bun run --filter registry dev          # http://localhost:3100
bun run registry:build                 # shadcn build + versioned copies in public/r/v
bun run --filter registry typecheck    # next typegen && tsc
```

`next dev` doesn't watch files outside this folder, so restart it to see a new skill or
knowledge file.

## 📐 Rules for registry items

- **Contract tokens only.** `no-raw-colors` runs in lint and on every edit.
- **Import `@/lib/utils` and `@/registry/groundwork/{ui,lib,hooks}/*`** — never
  `@/components/*`. Install-time rewriting only maps those prefixes.
- **Changing an item's content means bumping its `meta.version`.** `registry:build` fails
  on a silent change.
- **Commit `public/r/v/*`.** They're the merge bases `kit sync` needs.
- **Every item with markup has an example** in `app/examples/`.

The full version, with the reasons, is in [`AGENTS.md`](AGENTS.md). Read
[`knowledge/shadcn-registry.md`](../../knowledge/shadcn-registry.md) before touching setup.

## 🚀 Deploy

Vercel builds on every push to `main`. The URL written into `setup.json` comes from
`REGISTRY_URL`, else the Vercel production domain, else `http://localhost:3100` — the
`/docs` init command reads the same value, so the two always agree.
