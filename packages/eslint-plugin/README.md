# 🚦 @ja3dan/eslint-plugin

[![npm](https://img.shields.io/npm/v/@ja3dan/eslint-plugin)](https://www.npmjs.com/package/@ja3dan/eslint-plugin)

Keeps components on the [`@ja3dan/tokens`](https://www.npmjs.com/package/@ja3dan/tokens)
contract. One rule, `no-raw-colors`, that fails the build on any colour that isn't a
token — and runs in your editor, so you find out while typing rather than in review.

## Install

```bash
bun add -d @ja3dan/eslint-plugin
```

Needs ESLint 9 or later (flat config). `@ja3dan/tokens` comes with it; the rule reads its
allowlist straight from the contract, so it never goes out of date.

## Configure

```js
// eslint.config.mjs
import ja3dan from "@ja3dan/eslint-plugin";

export default [
  // …your other configs
  ja3dan.configs.recommended,
];
```

`recommended` turns `@ja3dan/no-raw-colors` on as an error for `**/*.{js,jsx,ts,tsx}`. To
scope it, override `files`:

```js
{ ...ja3dan.configs.recommended, files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"] }
```

## What it catches

It checks every string and template literal, so `className`, `cn()`, `cva()` and plain
constants are all covered.

| | Example | Instead |
| --- | --- | --- |
| ❌ Palette class | `text-gray-500` `bg-emerald-50` `border-white` | `text-muted-foreground` `bg-success-subtle` `border-border` |
| ❌ Arbitrary colour | `bg-[#0f172a]` `text-[oklch(0.5_0.1_250)]` | a token utility |
| ❌ Unknown variable | `bg-[var(--brand-blue)]` | a contract token, or `allowTokens` |
| ❌ Hardcoded value | `"#ff0000"` `"rgb(0 0 0)"` | `var(--primary)` |
| ✅ Token utility | `bg-card` `hover:text-foreground` `ring-ring` | — |
| ✅ With opacity | `bg-primary/10` `border-border/50` | — |

Variants (`hover:`, `dark:`, `data-[state=open]:`) and important markers are understood.

## Options

```js
{
  rules: {
    "@ja3dan/no-raw-colors": ["error", { allowTokens: ["brand-glow"] }],
  },
}
```

| Option | Type | |
| --- | --- | --- |
| `allowTokens` | `string[]` | Extra custom properties to accept in `var(--…)` references, on top of the contract. Use sparingly — a token every project needs belongs in the contract. |

## Contributing

Part of [groundwork](https://github.com/jaedanpersaud12/groundwork). Tests: `bun test` in
this folder, or `bun run test` from the root.

MIT
