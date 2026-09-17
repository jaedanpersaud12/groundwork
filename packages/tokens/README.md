# 🎨 @ja3dan/tokens

[![npm](https://img.shields.io/npm/v/@ja3dan/tokens)](https://www.npmjs.com/package/@ja3dan/tokens)

A semantic token contract for Tailwind v4 projects. It names what a colour is **for**
(`card`, `muted-foreground`, `destructive-subtle`); a theme decides what it **is**.

Components written against the contract work in any project that imports it, and take on
that project's brand without a line changing.

## Install

The easy way is the groundwork setup item, which installs this package and wires it in:

```bash
bunx shadcn@latest init https://gw.jaedan.me/r/setup.json
```

Or by hand:

```bash
bun add @ja3dan/tokens
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@ja3dan/tokens/theme.css";          /* the contract → Tailwind utilities */
@import "@ja3dan/tokens/base.css";           /* border, ring and body defaults */
@import "@ja3dan/tokens/themes/neutral.css"; /* the values */
```

## Use

Tokens are ordinary Tailwind utilities, opacity modifiers included:

```tsx
<div className="rounded-lg bg-card text-card-foreground shadow-border">
  <p className="text-muted-foreground">Saved</p>
  <span className="bg-success-subtle text-success">Active</span>
</div>
```

What you don't write: hex values, arbitrary colours (`bg-[#fff]`) or palette classes
(`text-gray-500`). [`@ja3dan/eslint-plugin`](https://www.npmjs.com/package/@ja3dan/eslint-plugin)
fails the build on all three.

## What's in the contract

**43 colour tokens** in seven groups — 30 required, 13 optional — plus radius, shadows and
a heading typeface.

| Group | Tokens |
| --- | --- |
| **surface** | `background` `foreground` `card` `card-foreground` `popover` `popover-foreground` `muted` |
| **text** | `muted-foreground` `subtle-foreground` |
| **action** | `primary` `secondary` `accent`, each with `-foreground` |
| **line** | `border` `input` `ring` |
| **status** | `destructive` `success` `warning` `info`, each with `-foreground` and `-subtle` |
| **chart** | `chart-1` … `chart-5` *(optional)* |
| **sidebar** | `sidebar` and seven variants *(optional)* |
| **radius** | `--radius`, scaled to `rounded-xs` … `rounded-xl` |
| **shadows** | `shadow-border`, `shadow-border-hover`, `shadow-popover` |
| **typography** | `font-heading` *(optional; defaults to the sans font)* |

Every token's role is in [`TOKENS.md`](TOKENS.md).

## 🖌️ Themes

| Theme | |
| --- | --- |
| `themes/neutral.css` | The default: greyscale surfaces, a near-black primary. The one to copy for a new brand. |
| `themes/violet.css` | Cool grey surfaces and a violet primary. |
| `themes/blue.css` | Cool grey surfaces, navy-leaning dark, and an ultramarine primary. What the groundwork site itself uses. |

To make your own, copy `neutral.css` into your project, change the values, and import it
in place of the shipped theme. A theme must define every required token in **both**
`:root` (light) and `.dark`, and nothing outside the contract — unless it has no dark mode on
purpose (a gallery, a print-first portfolio): then drop `.dark` and add the comment
`/* @ja3dan/tokens light-only */` to the theme file, and `kit check` requires `:root` only.

## Files

| Export | |
| --- | --- |
| `@ja3dan/tokens/contract.json` | Source of truth: names, groups, roles, required flags |
| `@ja3dan/tokens/theme.css` | Generated `@theme inline` mapping |
| `@ja3dan/tokens/base.css` | Shared base-layer rules and the `scroll-slim` utility |
| `@ja3dan/tokens/themes/*` | The values, per brand |
| `@ja3dan/tokens/TOKENS.md` | Generated, readable table of every token |

## Contributing

Part of [groundwork](https://github.com/jaedanpersaud12/groundwork). `theme.css` and
`TOKENS.md` are generated — change `contract.json` and run `bun run tokens`. The rules for
changing the contract are in [`AGENTS.md`](AGENTS.md).

MIT
