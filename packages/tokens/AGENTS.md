# Tokens

The contract every project and every registry item depends on. Widest blast radius in the
repo: a change here reaches every theme, every component and the lint allowlist.

Use the **token-change** skill for any change, and the **tokens-review** subagent before it
lands.

## Never edit these

`theme.css` and `TOKENS.md` are **generated**. Both carry a "Do not edit" header, and a
PreToolUse hook refuses writes to either — the rule was prose before and prose did not hold
it.

Change `contract.json`, then `bun run tokens`.

## What lives where

| File | |
| --- | --- |
| `contract.json` | **Source of truth.** Token names, groups, roles, required flags. |
| `theme.css` | Generated. The Tailwind v4 `@theme inline` mapping. |
| `TOKENS.md` | Generated. The readable table. |
| `base.css` | Hand-written. Shared `@layer base` rules and the `scroll-slim` utility. |
| `themes/*.css` | Hand-written. The **values**, per brand, in `:root` and `.dark`. |
| `scripts/build.ts` | Generates both outputs and validates every theme. |
| `scripts/contract.ts` | Parses the contract; exports `requiredTokens`, `declaredIn`, etc. |

Names and roles belong to the contract. Values belong to a theme. A `role` that can only be
written by naming a colour is a value that got into the contract by mistake — it will not
survive a second brand.

## Invariants

- **Every `themes/*.css` defines every required token in both `:root` and `.dark`.**
  `bun run tokens` fails per theme and per selector otherwise.
- **A theme declares nothing outside the contract.** An invented custom property is an
  invented token that nothing else knows about; the build rejects it.
- **A new `required: true` token breaks every existing theme** until each one defines it.
  Prefer `required: false` unless every brand genuinely needs it — `chart-*` and
  `sidebar-*` are optional for exactly this reason.
- Shadows are `--depth-<name>` in a theme and surface as `shadow-<name>`. Typography is
  `--typeface-<name>` → `font-<name>`.

## The check the build cannot do

`bun run tokens` catches a **missing** token. It cannot catch a **stale** one — a value
changed in `:root` and forgotten in `.dark`. That is the most common real bug in a theme
diff, so diff the two selectors against each other by hand.

Same for contrast: status colours are used as ~12px text on a 10% tint of themselves.
Compute the ratio against the composited background, in both selectors, and target 4.5:1.

## Commands

```bash
bun run tokens        # regenerate theme.css + TOKENS.md, validate every theme
```
