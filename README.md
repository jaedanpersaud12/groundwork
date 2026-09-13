# Groundwork

The shared starting point for every ja3dan project.

- **`@ja3dan/tokens`** (npm): a semantic token contract, its Tailwind v4 mapping, and themes. Projects import it; nobody edits it locally.
- **`@ja3dan/eslint-plugin`** (npm): fails the build on hex values, arbitrary colours and palette classes.
- **`@ja3dan` registry** (shadcn): components copied into projects, where they stay editable. Every version is kept so updates can merge with local edits.

## Start a new project

```bash
bunx create-next-app@latest my-app --ts --tailwind --eslint --app --use-bun
cd my-app
bunx shadcn@latest init https://<registry-domain>/r/setup.json
bunx shadcn@latest add @ja3dan/button --overwrite   # init adds shadcn's own button
```

Then replace `app/globals.css` with the setup imports (create-next-app's template CSS overrides the theme):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@ja3dan/tokens/theme.css";
@import "@ja3dan/tokens/base.css";
@import "@ja3dan/tokens/themes/neutral.css";
```

and add `ja3dan.configs.recommended` from `@ja3dan/eslint-plugin` to `eslint.config.mjs`.

## Roadmap

1. ~~Design registry, minimal version~~ tokens, lint, 20 items (primitives, table patterns, date pickers, data-table block), versioned build: done
2. jobpilot as first consumer (after its 09 branch merges)
3. `kit sync` — update installed components across projects, one PR each
4. Agent kit — skills, templates, knowledge, `kit check` / `doctor`
5. `/kickoff` end to end on a throwaway project
6. Marketing site (`apps/site`)

The full plan: https://claude.ai/code/artifact/365ae5f1-b1f5-49ce-9e35-9aec5c0b44ae
# groundwork
