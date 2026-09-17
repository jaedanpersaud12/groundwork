<div align="center">

<img src="apps/registry/public/groundwork-purple.svg" alt="" width="72" height="72">

# groundwork

**The foundation a new repo starts on.**

The skills and context your agents work from, a token contract your components can't
break, and the gotchas you already paid for somewhere else.

[Docs](https://gw.jaedan.me/docs) · [Components](https://gw.jaedan.me/#registry) · [Token contract](https://gw.jaedan.me/docs/tokens)

[![@ja3dan/kit](https://img.shields.io/npm/v/@ja3dan/kit?label=%40ja3dan%2Fkit)](https://www.npmjs.com/package/@ja3dan/kit)
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
| **Where** | [`packages/kit`](packages/kit) · [`skills/`](skills) · [`prompts/`](prompts) · [`knowledge/`](knowledge) | [`packages/tokens`](packages/tokens) · [`packages/eslint-plugin`](packages/eslint-plugin) · [`apps/registry`](apps/registry) |

## 🚀 Start a project

**The whole kit** — skills, context, the design system, locked together:

```bash
bunx create-next-app@latest my-app --ts --tailwind --eslint --app --use-bun --yes
cd my-app
bunx @ja3dan/kit init next16-insforge
```

Then paste the three [kickoff prompts](prompts) into any LLM chat, in order, saving each answer
into `context/` (`project-overview.md`, `architecture.md`, `build-plan.md`), and start the first
feature with `/feature start 01`. `bunx @ja3dan/kit doctor` and `kit check` confirm the setup.
The full guide, including sandboxed agents and apps at a repo root, is at
[gw.jaedan.me/docs](https://gw.jaedan.me/docs).

**Only the design system:**

```bash
bunx shadcn@latest init https://gw.jaedan.me/r/setup.json
bunx shadcn@latest add @ja3dan/button --overwrite   # init also adds shadcn's own button
```

`init` installs `@ja3dan/tokens` and the lint plugin, wires the theme into your CSS and registers
the `@ja3dan` registry. It can't replace create-next-app's `globals.css` or turn the lint rule on —
`kit init` does both; by hand, see the [docs](https://gw.jaedan.me/docs#design-system). Browse
installable items with `bunx @ja3dan/kit list` or the [component index](https://gw.jaedan.me/#registry).

## 🔄 Keeping a project current

```bash
bunx @ja3dan/kit@latest sync status        # components: outdated, edited
bunx @ja3dan/kit@latest sync update button  # one component, 3-way merged with your edits
bunx @ja3dan/kit@latest skills status      # skills: current, outdated, edited, missing, new
bunx @ja3dan/kit@latest skills update      # installs this kit's skills; edited ones need --force
```

## 🔁 The loop

Every feature takes the same path, and each step leaves a file in the feature's folder.

```
/feature start NN  →  /architect  →  build  →  /review  →  /feature finish
    spec.md            plan.md       log.md    review.md    refuses to close without evidence
```

`/remember`, `/recover`, `/harvest` and `/imprint` run when something happens rather than in order.
`app-ui` is read before building or reviewing any signed-in app screen: the sidebar shell, loading
skeletons, fixed-height tables, icon row menus and modals for create/edit. No slash commands in
your agent? Point it at each skill's file — see [`skills/`](skills) and
[the site](https://gw.jaedan.me/docs/loop).

## 🗂️ What's in here

| Path | What | Ships as |
| --- | --- | --- |
| [`packages/tokens`](packages/tokens) | The token contract, its Tailwind v4 mapping, and themes | npm `@ja3dan/tokens` |
| [`packages/eslint-plugin`](packages/eslint-plugin) | `no-raw-colors`, with its allowlist read from the contract | npm `@ja3dan/eslint-plugin` |
| [`packages/kit`](packages/kit) | The CLI: `init`, `list`, `sync`, `skills`, `lock`, `check`, `doctor`, `link` | npm `@ja3dan/kit` |
| [`apps/registry`](apps/registry) | The site, and the source of every registry item | [gw.jaedan.me](https://gw.jaedan.me) · shadcn registry `@ja3dan` |
| [`skills/`](skills) | The skills a new project gets: the lifecycle loop and `app-ui` | agent kit |
| [`prompts/`](prompts) | The three kickoff prompts — interview, architecture, build plan | agent kit |
| [`templates/`](templates) | Files `kit init` copies into `context/`, per preset | agent kit |
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
| ✅ | **03** A first consuming project |
| ✅ | **04** `packages/kit`: sync engine |
| ✅ | **05** `packages/kit`: check and doctor |
| ✅ | **06** `/kickoff` prompts, and `templates/` |
| 🚫 | **07** retired — `apps/registry`'s landing page (08) absorbed its job |
| ✅ | **08** The groundwork site |
| ✅ | **09** `packages/kit`: `kit init` |
| ✅ | **10** `imprint`, and `ui-registry.md` with it |
| ✅ | **11** Show, don't tell — the landing page |
| 🚧 | **12** Docs refresh, starting with setup |
| ✅ | **13** App UI doctrine — the `app-ui` skill |
| ✅ | **14** Fixes from real projects — `kit skills`, `kit list`, light-only themes, `native-select` |
| ⬜ | **15** Tokens: three named radii, nav tints, scrim |
| ⬜ | **16** Dropdown, menu, dialog, alert dialog |
| ⬜ | **17** App shell |
| ⬜ | **18** Figures and controls |
| ⬜ | **19** Skeletons and fixed-height tables |

The copy of record, with every stage's "done when", is
[`context/build-plan.md`](context/build-plan.md).
