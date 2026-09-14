<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- Everything below is hand-written. `next dev` only rewrites the fenced block above. -->

# Registry app

Serves the `@ja3dan` shadcn registry and previews every item. Read
[knowledge/shadcn-registry.md](../../knowledge/shadcn-registry.md) before touching
anything here — it is verified against the installed shadcn, unlike training data.

Use the **registry-item** skill for adding or changing an item, and the
**registry-review** subagent before the change lands.

## Two different trees

| Path | What it is |
| --- | --- |
| `registry/groundwork/**` | **Shipped.** Copied into other people's projects. |
| `app/**` | The preview site. Never installed anywhere. |

The rules below are about `registry/**`. `app/**` is an ordinary Next app — though it uses
the registry's own components, so it is also the first place a bad change shows up.

## Invariants

- **Contract tokens only** in `registry/**`. `no-raw-colors` runs in `bun run lint` and on
  every edit via a hook.
- **Import `@/lib/utils` and `@/registry/groundwork/{ui,lib,hooks}/*`**, never
  `@/components/*`. Install-time rewriting maps only those two prefixes; anything else
  ships a broken import and the build will not catch it.
- **Bump `meta.version` for any content change.** `registry:build` hashes each item against
  its published copy in `public/r/v/` and fails on a silent change — those copies are the
  merge bases `kit sync` needs, so a changed version is a corrupted base for everyone who
  already installed it.
- **A new major version carries its own migration note** in `meta.migrations`
  (`{ "2.0.0": "what a project has to change" }`), and every version published after it —
  major or not — must keep carrying that note forward. `registry:build` fails a new major
  with no note of its own, and fails **any** new version that drops a note an earlier
  published version had: `kit sync update` reads notes off whichever version a project
  updates *to*, not off every version in between, so a dropped note reaches a project as
  silence.
- **Commit `public/r/v/*`.** Uncommitted, the merge bases exist on one machine only.
- **Every item with markup needs an example** keyed by its registry `name` under
  `app/examples/`, reachable from `index.tsx`. Libs and hooks are exempt and correctly show
  "No visual preview".

## The site's one scroll effect

`app/_site/reveal.tsx` fades sections in on scroll. Three guards keep it from ever leaving a
reader on a blank page, and they are easy to undo by accident:

- The hidden starting state is in `globals.css` inside
  `@media (prefers-reduced-motion: no-preference)` — **never set `opacity: 0` from
  JavaScript**. `globals.css` zeroes every transition under `reduce`, so a JS-owned hidden
  state strands anyone with that preference if the observer never runs.
- `layout.tsx` carries a `<noscript>` rule (scripting off) and an inline failsafe script
  (scripting on, bundle never arrives — `Reveal` switches it off by setting `__gwReveal`).
- `Reveal` itself has a timer for the observer-never-reports case.

Removing any one of them reintroduces a state where content is permanently invisible.
`context/features/11-show-not-tell/log.md` has the five-state verification table.

## Commands

```bash
bun run --filter registry dev          # port 3100, or .claude/launch.json → registry
bun run registry:build                 # shadcn build + versioned copies
bun run --filter registry typecheck
```
