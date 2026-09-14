# 11 — log

## Baseline, before any change

Measured against `e62791d` with the dev server on :3100, by stripping
`script/style/svg/noscript`, tags and entities from the served HTML of each route and
counting words. Same script re-run after the change, so the two numbers are comparable
(script: `scratchpad/rendered-words.mjs`).

| Route | Visible words |
| --- | --- |
| `/` | 930 |
| `/docs` | 629 |
| **Total** | **1559** |

## Findings from the audit

- `apps/registry/app/docs/page.tsx:97-98` states the automated half (`kit init`) does not
  exist yet. `packages/kit/src/commands/init.ts` has existed since 09 merged in PR #10, and
  `/docs/kickoff` already describes `kit init` as real — so the two pages contradict each
  other. Correcting this is a criterion, not a nicety.
- `packages/eslint-plugin/index.js:81-88` holds four real message templates. The
  `palette` one reads:
  `` `{{className}}` is a raw Tailwind palette colour. Use a token utility (see @ja3dan/tokens/TOKENS.md). ``
  The site currently paraphrases this as a prose bullet. Showing the real string is both
  shorter and proof rather than claim.
- The `no-raw-colors` rule and the `context/` tree are the two places the site already
  proves itself. `repo.ts` already has the build-time readers needed to do the same for
  `skills/` — `readSkill()` returns the frontmatter description and body.
