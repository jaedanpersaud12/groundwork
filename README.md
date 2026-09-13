<div align="center">

# 🧱 groundwork

**The foundation a new repo starts on.**

The skills and context your agents work from, a token contract your components can't
break, and the gotchas you already paid for somewhere else.

[Docs](https://gw.jaedan.me/docs) · [Components](https://gw.jaedan.me/#registry) · [Token contract](https://gw.jaedan.me/docs/tokens)

[![@ja3dan/tokens](https://img.shields.io/npm/v/@ja3dan/tokens?label=%40ja3dan%2Ftokens)](https://www.npmjs.com/package/@ja3dan/tokens)
[![@ja3dan/eslint-plugin](https://img.shields.io/npm/v/@ja3dan/eslint-plugin?label=%40ja3dan%2Feslint-plugin)](https://www.npmjs.com/package/@ja3dan/eslint-plugin)

</div>

---

## Two halves

Take either one on its own. Most projects take both, which is the point.

| | 🤖 The agent kit | 🎨 The design system |
| --- | --- | --- |
| **What** | Skills, a `context/` scaffold, and a knowledge base of gotchas | A token contract, a lint rule, and a shadcn registry of components |
| **Why** | A new repo starts with its architecture written down, not a blank `CLAUDE.md` | The same button works in every project and takes on each project's theme |
| **Where** | [`skills/`](skills) · [`knowledge/`](knowledge) · [`context/`](context) | [`packages/tokens`](packages/tokens) · [`packages/eslint-plugin`](packages/eslint-plugin) · [`apps/registry`](apps/registry) |

## 🚀 Start a project on the contract

```bash
bunx create-next-app@latest my-app --ts --tailwind --eslint --app --use-bun
cd my-app
bunx shadcn@latest init https://gw.jaedan.me/r/setup.json
bunx shadcn@latest add @ja3dan/button --overwrite   # init also adds shadcn's own button
```

`init` installs `@ja3dan/tokens` and the lint plugin, wires the theme into your CSS and
registers the `@ja3dan` registry. Two things it can't do for you:

1. **Replace `app/globals.css`** — create-next-app's template CSS overrides the theme:

   ```css
   @import "tailwindcss";
   @import "tw-animate-css";
   @import "@ja3dan/tokens/theme.css";
   @import "@ja3dan/tokens/base.css";
   @import "@ja3dan/tokens/themes/neutral.css";
   ```

2. **Turn on the lint rule** in `eslint.config.mjs` — see [`@ja3dan/eslint-plugin`](packages/eslint-plugin).

Then add anything from the [component index](https://gw.jaedan.me/#registry):
`bunx shadcn@latest add @ja3dan/data-table`.

> [!NOTE]
> This sets up the design system only. It doesn't create skills, a `context/` folder or
> knowledge files — that's `/kickoff`, which is still being built (stages 06 and 09).

## 🔁 The loop

Every feature takes the same path, and each step leaves a file in the feature's folder.

```
/feature start NN  →  /architect  →  build  →  /review  →  /feature finish
    spec.md            plan.md       log.md    review.md    refuses to close without evidence
```

`/remember`, `/recover` and `/harvest` run when something happens rather than in order.
Details in [`skills/`](skills) and on [the site](https://gw.jaedan.me/docs/loop).

## 🗂️ What's in here

| Path | What | Ships as |
| --- | --- | --- |
| [`packages/tokens`](packages/tokens) | The token contract, its Tailwind v4 mapping, and themes | npm `@ja3dan/tokens` |
| [`packages/eslint-plugin`](packages/eslint-plugin) | `no-raw-colors`, with its allowlist read from the contract | npm `@ja3dan/eslint-plugin` |
| [`apps/registry`](apps/registry) | The site, and the source of every registry item | [gw.jaedan.me](https://gw.jaedan.me) · shadcn registry `@ja3dan` |
| [`skills/`](skills) | The lifecycle skills a new project gets | agent kit |
| [`knowledge/`](knowledge) | Gotchas tagged by stack | agent kit |
| [`context/`](context) | This repo's own overview, standards, build plan and feature folders | — |

## 🛠️ Working on groundwork

```bash
bun install
bun run check       # tokens, lint-rule tests, eslint, versioned registry build
bun run registry:dev
```

CI runs `check`, confirms nothing it generates is out of date, then typechecks and builds
the site. Rules for agents and humans alike live in [`AGENTS.md`](AGENTS.md); the house
style is [`context/standards.md`](context/standards.md).

## 🧭 Roadmap

| | Stage |
| --- | --- |
| ✅ | **01** Design registry, minimal version |
| ✅ | **02** Agent kit scaffold |
| ⬜ | **03** jobpilot becomes the first consumer |
| 🚧 | **04** `packages/kit`: sync engine |
| ⬜ | **05** `packages/kit`: check and doctor |
| ⬜ | **06** `/kickoff` prompts, and `templates/` |
| ⏸️ | **07** `apps/site` — on hold |
| ✅ | **08** The groundwork site |
| ⬜ | **09** `packages/kit`: `kit init` |

The copy of record, with every stage's "done when", is
[`context/build-plan.md`](context/build-plan.md).
