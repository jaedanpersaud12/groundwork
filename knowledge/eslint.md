---
scope: stack
stack: [eslint-9]
verified_version: eslint 9.39.5, @typescript-eslint/parser 8.70.0
verified_on: 2026-09-13
---

# ESLint 9 flat-config gotchas

- **A shareable `plugin.configs.recommended` rarely ships a parser, only `plugins` and
  `rules`.** It's written to be composed into a project's own flat config, which already
  supplies a parser for `.tsx`/`.jsx` via something like `eslint-config-next` or
  `typescript-eslint`'s own config. Running a plugin's config standalone (e.g. a CLI tool
  linting a target project's files in-process, with no `eslint.config.js` of its own) hits
  a bare `espree` parser, which chokes on JSX with `Parsing error: Unexpected token <`. Add
  `@typescript-eslint/parser` explicitly via `languageOptions.parser` in a `baseConfig`
  entry ahead of the plugin's own config.
- **JSX support goes under `languageOptions.parserOptions.ecmaFeatures.jsx`, not
  `languageOptions.ecmaFeatures.jsx`.** The latter throws `TypeError: Key
  "languageOptions": Unexpected key "ecmaFeatures" found` — flat config's
  `languageOptions` only accepts `ecmaVersion`, `sourceType`, `parser`, `parserOptions`,
  `globals`, and (for JS) `parserOptions` is where `ecmaFeatures` still lives.
- **`new ESLint({ overrideConfigFile: true, baseConfig: [...] })` runs entirely in-memory,
  no `eslint.config.js` needed in the target project** — useful for a tool that lints
  someone else's project with its own bundled rules, scoped to specific files via
  `lintFiles(paths)` rather than a project-wide `files` glob.
