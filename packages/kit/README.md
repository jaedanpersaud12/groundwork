# @ja3dan/kit

The CLI for [groundwork](https://gw.jaedan.me): sets a Next.js project up with the skills, context
scaffold and design system, then keeps its components and skills current.

```bash
bunx create-next-app@latest my-app --ts --tailwind --eslint --app --use-bun --yes
cd my-app
bunx @ja3dan/kit init next16-insforge
```

## Commands

| Command | Does |
| --- | --- |
| `kit init <preset>` | Copies the preset's files into `context/`, installs the skills into `.claude/skills/`, runs `shadcn init` against the registry, cleans create-next-app's CSS, wires the lint rule, adds a `check` script, and locks components and skills in `kit.lock.json`. Run inside an existing app. |
| `kit list [--url <url>]` | Every item the registry can install, its latest version, and which are installed. Works outside a project. |
| `kit sync status` | Installed components: outdated, edited locally, missing files. |
| `kit sync update <item>` | Updates one component on a branch — overwrites if unedited, 3-way merges your edits otherwise. `--to <version>`, `--accept-major`. |
| `kit skills status` | The project's skills against this kit's: current, outdated, edited, missing, new, retired. |
| `kit skills update [name…]` | Installs this kit's version of outdated, missing and new skills and re-locks them. Edited skills are left alone unless `--force`. |
| `kit lock [--force]` | Writes `kit.lock.json` for the components already installed. `--force` rebuilds it and keeps the locked skills. |
| `kit check` | Raw colours in locked files, and a theme missing required tokens in `:root` or `.dark`. A theme with no dark mode on purpose adds `/* @ja3dan/tokens light-only */`. |
| `kit doctor` | Required files; the three kickoff docs in `context/` and their sections (pending until the first feature folder exists); kit files hidden by `.gitignore`; outdated or missing items. |
| `kit link [--url <url>]` / `--off` | Points `@ja3dan` at a local registry while developing groundwork, and back. |

All commands take `--cwd <dir>`. Registry requests retry transient network errors.

## Keeping a project current

```bash
bunx @ja3dan/kit@latest skills status && bunx @ja3dan/kit@latest skills update
bunx @ja3dan/kit@latest sync status && bunx @ja3dan/kit@latest sync update <item>
```

## Sandboxed agents

If `bunx` fails with `EPERM` before the kit runs, point its temp and cache dirs somewhere writable:
`TMPDIR=/tmp BUN_INSTALL_CACHE_DIR=/tmp/bun-cache bunx @ja3dan/kit …`. A first
`ConnectionRefused downloading package manifest` that works on retry is the download, not your
registry configuration.

Docs: [gw.jaedan.me/docs](https://gw.jaedan.me/docs) · Source:
[packages/kit](https://github.com/jaedanpersaud12/groundwork/tree/main/packages/kit)
