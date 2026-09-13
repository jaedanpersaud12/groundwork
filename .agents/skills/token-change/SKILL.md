---
name: token-change
description: Change the token contract or a theme without breaking the generated files or the themes that depend on them. Use before touching packages/tokens/contract.json, themes/*.css or base.css.
---

Groundwork-only. The contract is the one thing every project and every component depends
on, so a change here is the widest-blast-radius change in the repo.

## The rule that gets broken

**Never edit `packages/tokens/theme.css` or `packages/tokens/TOKENS.md`.** Both are
generated. Both say so in a header comment. Both are tempting, because the thing you want
to change is visible right there in them.

Change `packages/tokens/contract.json`, then run `bun run tokens`. A hook blocks direct
edits to either file, which is the point — the rule was prose before and prose didn't hold.

## What lives where

| File | What it is |
| --- | --- |
| `contract.json` | **Source of truth.** Token names, groups, roles, which are required. |
| `theme.css` | Generated. The Tailwind v4 `@theme inline` mapping. |
| `TOKENS.md` | Generated. The human-readable table. |
| `base.css` | Hand-written. Shared `@layer base` rules and utilities like `scroll-slim`. |
| `themes/*.css` | Hand-written. The **values**, per brand, in `:root` and `.dark`. |

Names and roles are the contract's business; values are a theme's business. A token whose
role can't be stated without naming a colour is a value wearing a name's clothes.

## Adding a token

1. Add it to `contract.json` under the right `group` (`surface`, `text`, `action`, `line`,
   `status`, `chart`, `sidebar`), with a `role` that says what it's *for*, not what it
   looks like. `required: true` means **every** theme must define it.
2. `bun run tokens` — regenerates both files and validates every theme.
3. If it's required, add it to **every** `themes/*.css`, in **both** `:root` and `.dark`.
   The build fails otherwise, per selector, naming what's missing.
4. Prefer `required: false` for anything not every brand needs — `chart-*` and `sidebar-*`
   are optional for exactly this reason. A new required token is a breaking change for
   every theme that exists.

Shadows are `--depth-<name>` in themes and surface as `shadow-<name>` utilities.
Typography is `--typeface-<name>` → `font-<name>`.

## Changing a value in a theme

Only the theme file changes; the contract doesn't. But **both selectors**: a value changed
in `:root` and forgotten in `.dark` is the single most common bug here, and the build
catches a *missing* token, not a *stale* one.

## Check the contrast, don't assume it

Status colours get used as small text on a 10% tint of themselves. A hue that reads fine as
a solid fill frequently fails at 12px on its own wash — that's how `warning` and `danger`
ended up darker than their source palettes.

Compute the ratio against the actual composited background rather than eyeballing it:
the tint over the theme's `background`, not the raw token over white. Aim for 4.5:1 on
both `:root` and `.dark`. If you can't hit it without changing the hue, say so and let the
developer choose between contrast and brand.

## Adding a theme

Copy `themes/neutral.css` — it's the documented starting point — and replace the values.
`bun run tokens` validates it: every required token in both selectors, and **no tokens
outside the contract**. That second check is deliberate; a theme that invents a custom
property has invented a token nothing else knows about.

## After any change

`bun run check`, then look at the registry preview in **both themes** before calling it
done. The generated files are a claim about what the themes contain; the preview is the
only place you find out whether it looks right.
