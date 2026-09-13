---
name: registry-item
description: Add or change a component in the @ja3dan registry without breaking the invariants — contract tokens, import paths, version bumps, examples and the versioned build. Use before touching apps/registry/registry/** or registry.json.
---

Groundwork-only. Every rule here exists because breaking it either ships a component that
can't be installed, or silently breaks `kit sync` for every project that already has it.

## Read this first

`knowledge/shadcn-registry.md`. Every bullet in it is a trap someone already fell into,
verified against the installed shadcn. Read it before the first edit, not after the build
fails.

## The loop

**1. Source file** — `apps/registry/registry/groundwork/{ui,lib,hooks,blocks}/<name>.tsx`.

Two rules the build can't catch for you:

- **Contract tokens only.** No `emerald-500`, no `#fff`, no `oklch(...)`, no `var(--x)`
  that isn't in `contract.json`. `@ja3dan/eslint-plugin`'s `no-raw-colors` enforces it,
  and a hook runs it at edit time — but write it right the first time, because the fix
  after the fact is usually "invent a token", which is a contract change, not a component
  change.
- **Import `@/lib/utils` and `@/registry/groundwork/ui/*`**, never `@/components/*`.
  Install-time rewriting maps those two prefixes onto the consumer's own aliases. A
  `@/components/*` import lands in a project that has no such file.

**2. Register it** in `apps/registry/registry.json`:

```json
{
  "name": "status-pill",
  "type": "registry:ui",
  "title": "Status pill",
  "description": "What it is and when to reach for it — this is what shows on the docs page.",
  "dependencies": ["lucide-react"],
  "registryDependencies": ["@ja3dan/button"],
  "files": [{ "path": "registry/groundwork/ui/status-pill.tsx", "type": "registry:ui" }],
  "meta": { "version": "1.0.0", "tier": "primitive", "track": "minor", "source": "flvs" }
}
```

`tier` is one of `setup | block | primitive | pattern | hook | lib` and drives which group
it appears under on the docs page. `track` is `patch | minor | none` — the default update
policy consumers get. Cross-item deps are **namespaced**: `"@ja3dan/button"`. A bare
`"button"` resolves to shadcn's official button, not ours.

**3. Bump `meta.version` for any content change.** This is the invariant with teeth:
`registry:build` hashes every built item against the published copy in `public/r/v/` and
fails if the content moved without the version moving. Those files are the merge bases
`kit sync` uses for a 3-way merge into a project that edited its copy — so a silently
changed 1.0.0 corrupts the merge base for everyone who already has it.

Patch for a fix that changes nothing about the API. Minor for anything additive. **Major**
for anything that makes a project change its code — and a major needs a note:

```json
"meta": {
  "version": "2.0.0",
  "migrations": { "2.0.0": "EmptyState takes an `action` prop instead of children." }
}
```

Keep earlier majors' notes when publishing the next one — every version, major or not —
since `kit sync update` reads notes off whichever version a project updates *to*, not off
every version in between. `registry:build` fails a new major whose own note is missing or
empty, and fails any version, later than that, that drops a note an earlier published
version carried. The note is content, so it can't be added to a published version
afterwards — write it when you cut the major, and copy it forward every time after.

**4. Add an example.** `apps/registry/app/examples/` — `primitives.tsx` for a single
static node, `pills.tsx` / `table.tsx` / `dates.tsx` for anything stateful, keyed by the
registry item's `name`. The index merges sets by key and concatenates, so the same name can
have examples in more than one file.

An item with no example renders "No visual preview" on the docs page. That's correct for a
lib or a hook and a bug for anything with markup.

**5. `bun run check`** — tokens, lint rule tests, eslint, and the versioned registry build.
Then confirm it actually renders: `bun run --filter registry dev` on port 3100, or
`.claude/launch.json` → `registry`.

**6. Commit `apps/registry/public/r/v/*`.** Those are the merge bases. Uncommitted, they
exist only on your machine and `kit sync` has nothing to merge against.

## When the build says "already published with different content"

It means the item's content changed but `meta.version` didn't. Bump the version — that is
almost always the right answer.

The exception is an item whose `1.0.0` was never actually published: nothing committed,
nothing installed anywhere. Then the baseline in `public/r/v/` is a stale local artifact,
and deleting it so the build rewrites it is honest where bumping to `1.0.1` would invent a
release that never happened. Check `git log` before deciding, and say which one you did.

## If the change needs a token that doesn't exist

Stop. That's a contract change — use `token-change`, land it, then come back. Adding a raw
value "just for now" is how the lint rule ends up with an allowlist of exceptions.
