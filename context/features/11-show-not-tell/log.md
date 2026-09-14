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

---

## Plan confirmed

2026-09-14. Scope narrowed mid-flight on the developer's call: `/docs` comes out of this
feature and gets its own pass. `spec.md`'s out-of-scope section carries the two findings
that pass inherits.

## Build

**The plugin import works under Turbopack.** This was the plan's one unverified assumption
— `@ja3dan/eslint-plugin` reaches `@ja3dan/tokens/contract.json` through an
`import ... with { type: "json" }` attribute. Adding the import to `repo.ts` and loading `/`
returned 200 with the section rendering, so no fallback was needed. `@ja3dan/eslint-plugin`
moved from `devDependencies` to `dependencies` in `apps/registry/package.json`, because it
is now build input rather than tooling.

**The specimen does not trip the rule, and the rule is still live on the file.** The
violation is shown as a whole line of JSX (`<div className="bg-blue-500 p-4">`), which is
both how it appears in real code and why `no-raw-colors` ignores it: the rule splits on
whitespace and `className="bg-blue-500` is not a colour utility. To prove the file is not
simply excluded, a bare `const PROBE = "bg-blue-500"` was added to `kit.ts` temporarily:

```
223:15  error  `bg-blue-500` is a raw Tailwind palette colour. Use a token utility
               (see @ja3dan/tokens/TOKENS.md)   @ja3dan/no-raw-colors
✖ 2 problems (1 error, 1 warning)
```

The rule fires on that exact file, and its message is character-for-character what the page
renders — which is the point, since the page reads it from `meta.messages` rather than
quoting it. Probe removed; lint back to exit 0.

**Card links were not bottom-aligned.** First render put "Read the loop" ~53px below "Read
the contract": the card was `grid content-start`, which packs rows to the top and leaves the
spare space *below* them, so `mt-auto` had nothing to push against. Changed to
`flex flex-col`; re-rendered and the two links share a baseline.

## Evidence, per criterion

- **Artefacts read from source, not copied.** `lintMessage("palette", …)` reads
  `plugin.rules["no-raw-colors"].meta.messages` and throws if the rule or message id is
  gone; `skillFrontmatter("feature")` reads `skills/feature/SKILL.md` and throws if the
  frontmatter block is gone. Served HTML contains `name: feature`,
  `skills/feature/SKILL.md`, the message text, `7 skills · installed by kit init` and
  `43 tokens · 2 themes · fails in the editor and in CI` — every number computed from disk
  (`skillNames().length`, `Object.keys(contract.tokens).length`).

- **Less word.** Same measurement either side, served HTML with tags and entities stripped,
  splitting `<pre>` content out as "shown" rather than "said":

  | | total | prose | shown as artefact |
  | --- | --- | --- | --- |
  | before | 930 | 930 | 0 |
  | after | 879 | 820 | 59 |

  Prose fell 110 words (−11.8%); total fell 51 (−5.5%). The gap between the two is the
  point: what remains is shorter *and* a tenth of it is now evidence instead of claim.
  Measured by swapping `d06e3a9`'s `page.tsx` and `kit.ts` back in, re-reading the live
  page, and restoring.

- **Scroll reveal, all three states.** The Claude Code Browser pane could not verify this:
  `requestAnimationFrame` never fired and a freshly-constructed `IntersectionObserver` never
  delivered a callback either, so `data-shown` stayed `false` for environmental reasons —
  the exact trap `knowledge/browser-verification.md` documents. Verified instead in a real
  headless Chromium (Playwright, installed in the scratchpad, not the repo), loading `/`,
  scrolling to the bottom and reading computed styles:

  | context | on load | after scrolling |
  | --- | --- | --- |
  | `no-preference` | `opacity: 0`, `translateY(12px)` ×4 | `opacity: 1`, `transform: none` ×4 |
  | `reduce` | `opacity: 1`, `transform: none` ×4 | unchanged |
  | JavaScript off | `opacity: 1`, `transform: none` ×4 | unchanged |

  Under `reduce` the content is never hidden at any point, and with JS off `data-shown`
  stays `"false"` while the `<noscript>` rule keeps it visible. Both `.reveal` rules live
  inside `@media (prefers-reduced-motion: no-preference)` in the compiled CSS, confirmed by
  reading the built stylesheet — so `reduce` gets visible content by there being no rule,
  rather than by overriding one.

- **Tabular figures.** Computed `font-variant-numeric` on a version cell is `tabular-nums`
  (sample `1.0.1`).

- **No overflow at 400px.** `documentElement.scrollWidth === 400 === innerWidth` in both
  `colorScheme: light` and `dark`; the widest element in both is `<html>` itself at 400px.

- **`bun run check`** exit 0. **`typecheck`** exit 0. **`build`** exit 0.

- **Nothing brand-level changed.** The diff touches no file under `packages/tokens/`, adds
  no runtime dependency (`@ja3dan/eslint-plugin` was already a workspace devDependency and
  only changed section), and introduces no font, icon or colour — `destructive`,
  `destructive-subtle` and `success` are existing contract tokens.

## Noted, not fixed

`next build` warns that `repo.ts:20`'s `readFileSync(path.join(ROOT, ...segments))` causes
the whole project to be traced into the server output. It is pre-existing — `d06e3a9`'s
`repo.ts` has the same nine `path.join` calls — and unrelated to this feature, but it means
the deployed function carries the repo. Worth its own look.
