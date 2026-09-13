# Code standards

## Comments explain why a value is what it is

This is the house style and the thing most worth getting right. A registry component gets
copied into a project and edited by someone who wasn't here. The comment's job is to stop
them changing a value that looks arbitrary and is not.

The reference specimen is `CHIP` in `apps/registry/registry/groundwork/ui/filter-chip.tsx`:

```tsx
/**
 * The one height every filter is built to — a 28px pill beside a 32px one reads as two
 * unrelated controls. The padding is the inset on all four sides and the halves stretch
 * into what's left, so the hover fill sits the same distance from every edge.
 */
const CHIP = "inline-flex h-8 items-stretch gap-0.5 rounded-lg border border-border bg-card p-1";
```

It says what breaks if you change it. Compare `// the chip's height`, which says only what
the reader can already see.

Rules of thumb:

- **Comment the non-obvious constraint, not the code.** If the line reads clearly, a
  comment restating it is noise.
- **Name the failure.** "so the curves are concentric", "or the hover fill sits closer to
  the top than the sides", "because Base UI wraps the trigger in a positioning div".
- **Prose, in full sentences.** Not telegraphese.
- **A `/** */` block above the thing** for anything load-bearing; `//` inline for a local
  aside.
- Nothing dated, nothing signed, no changelogs in comments — git holds that.

## Colour

No hex, no `oklch()`, no palette classes (`emerald-500`), no arbitrary values, no `var(--x)`
outside `contract.json`. `@ja3dan/eslint-plugin`'s `no-raw-colors` enforces it and a hook
runs it at edit time.

If a component needs a colour the contract doesn't have, that is a contract change. See
the `token-change` skill.

## Naming

- Files kebab-case: `status-pill.tsx`, `use-data-table.ts`.
- Components PascalCase; hooks `useThing`; a registry item's `name` matches its filename.
- Exports at the bottom, in one `export { … }` — it makes a file's surface readable in one
  place.
- Shared class-string constants SCREAMING_SNAKE (`CHIP`, `PILL`, `CHIP_TRIGGER`) so it's
  obvious at a use site that they're shared and changing one moves several things.

## TypeScript

Strict. `React.ComponentProps<"div"> & { … }` for anything wrapping an element, so
consumers keep `className`, `aria-*` and the rest without a prop-by-prop passthrough.
Generic over a union (`<T extends string>`) where a value and its options must agree —
`FilterChip` and `ViewToggle` both do this, and it's what makes a typo in an option value
a type error.

## Files that are not yours to edit

`packages/tokens/theme.css` and `TOKENS.md` are generated. `apps/registry/public/r/**` is
built. `apps/registry/AGENTS.md` is partly rewritten by `next dev` — write only outside its
`<!-- BEGIN:nextjs-agent-rules -->` fence.

## Before calling anything done

`bun run check` — tokens, lint-rule tests, eslint, versioned registry build. Then look at
it in the preview, in **both** themes. The check proves it's consistent; only the preview
proves it's right.
