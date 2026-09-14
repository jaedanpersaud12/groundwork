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

## Wrapping sections in `<div class="reveal">` — what it did not break

The sections were direct children of `<main>`; they are now each inside a wrapper div. That
is the kind of change that quietly breaks anchors, so it was checked rather than assumed
(headless Chromium, 1440×900):

- Clicking the hero's "See the components": `scrollY 2195`, `#registry` top at `80px` —
  which is `scroll-mt-20` doing its job through the new wrapper.
- Loading `/#registry` directly: same `scrollY 2195` and same `80px` offset, and the
  section's own reveal is already `data-shown="true"` / `opacity: 1`, so a deep link never
  lands on invisible content.
- Under `no-preference`, deep-linking to `#registry` leaves the two sections *above* the
  viewport still hidden. They reveal normally when scrolled up to, because
  `IntersectionObserver` fires on intersection regardless of scroll direction.
- Back-navigation (`/` → `/docs` → back) restores the same state.

---

## Responding to the review

`review.md` has the full findings. What changed, and what was checked afterwards.

### Critical 1 — the hardcoded theme count. Fixed.

The reviewer was right, and right about why it mattered: `THEME_COUNT = 2` sat inside the
one section built to prove the page cannot drift from the repo, and the log's claim that
"every number computed from disk" enumerated the two numbers that were and omitted the one
that wasn't. `repo.ts` gains `themeNames()`, reading `packages/tokens/themes/*.css` the same
way `skillNames()` and `contextFiles()` read theirs.

Demonstrated rather than argued this time — dropping a third theme file into `themes/` and
reloading:

```
43 tokens · 2 themes · fails in the editor and in CI     ← before
43 tokens · 3 themes · fails in the editor and in CI     ← with themes/__probe.css present
43 tokens · 2 themes · fails in the editor and in CI     ← probe removed, server restarted
```

(The count does not fall back on its own without a restart: `repo.ts` reads once per module
load and `next dev` does not watch outside `apps/registry`, which its own comment says.)

### Layer 1's evidence gap — the reword half. Now shown.

The criterion asked for "changing each source" and the log had only recorded the deletion
half. Rewording the message in `packages/eslint-plugin/index.js` to
`… is a raw Tailwind palette colour (REWORDED PROBE).` and reloading put `REWORDED PROBE` on
the landing page. Plugin restored; `git status packages/` clean.

### Important 2 — the fail-closed reveal. Fixed, and the suggested fix was not enough.

The reviewer proposed a failsafe inside the existing effect. That closes "observer never
reports" but not the state it actually named: if the client bundle never arrives, the effect
never runs, so a timer inside it never runs either. The guard has to live somewhere that
does not depend on the bundle, so it is an inline `<script>` in `layout.tsx` — the same
pattern `THEME_SCRIPT` already uses — which sets `data-reveal-failsafe="on"` on `:root`
after 2.5s unless `Reveal` has set `window.__gwReveal` on mount. The in-effect timer stays
as well, for the observer-never-reports case.

Five states, computed styles, headless Chromium:

| state | on load | settled |
| --- | --- | --- |
| `no-preference`, scrolls | hidden, shifted | visible, no transform |
| `reduce` | visible | visible |
| JavaScript off | visible | visible |
| **JS on, JS bundle blocked** | **hidden** | **visible** (inline failsafe; `data-shown` never leaves `"false"`) |
| `no-preference`, never scrolls | hidden | visible (in-effect failsafe) |

The fourth row is the one that matters, and it is genuinely the hazard state — it starts
hidden, exactly as a real chunk-404 would, and recovers. A first attempt at this test blocked
`_next/static/chunks/**`, which took the *stylesheet* with it and so proved nothing; blocking
only `**/_next/static/**/*.js` reproduces the real failure.

### Important 3 — the specimen's accidental safety. Fixed.

`OFFENDING_CLASS` is now assembled (`["bg","blue","500"].join("-")`) and `VIOLATION` built
from it, so no literal in the file contains the class and the file no longer depends on the
rule's whitespace tokeniser to pass. This also removes Minor 8 — the positional regex is
gone, and the class in the message is the class in the line by construction.

### Important 4 — build-plan vs spec. Fixed.

`context/build-plan.md` stage 11 now records the mid-flight narrowing and its "Done when"
matches `spec.md`'s. It also now requires the JS-failure state, which the original did not.

### Important 5 — `LintFailure` accessibility. Fixed.

Each line carries an `sr-only` "Fails: " / "Passes: " alongside the `aria-hidden` glyph, so
the distinction no longer rests on colour, which AT does not expose.

### Bookkeeping — "adds no runtime dependency". Amended.

The reviewer was right that this was argued around rather than corrected. `spec.md` now
states the criterion as written and records that the original wording was not met.

### Also taken

- **Minor 7** — `SPECIMEN` is validated against `skillNames()` with a real message. Note the
  underlying ordering problem is *not* fixed: `readSkill("feature")` still runs earlier in
  `kit.ts` for the LOOP, so a deleted `skills/feature/` still throws `ENOENT` first. That is
  pre-existing and belongs to `kit.ts` as a whole, not this feature.
- **Minor 9** — `@media print` now resets `.reveal`, so printing `/` no longer yields four
  blank sections.
- **Minor 10** — `Reveal` holds `useState` instead of calling `setAttribute` on a node React
  owns.
- **Minor 11** — `lintMessages` is no longer exported; it has no consumer outside `repo.ts`.
- **Minor 12** — `LintFailure` gains a `CopyButton`, copying the fixed line, so it matches
  the `SourceBlock` beside it.

### Left for the `/docs` pass

- **Minor 6** — `EVIDENCE` and `HALVES` are now two independent descriptions of the same two
  halves with nothing tying them. Deliberate while `/docs` is deferred, but the divergence
  starts here. Recorded in `spec.md`'s out-of-scope list so the docs pass inherits it.

### After the fixes

`bun run check` exit 0 · `typecheck` exit 0 · `build` exit 0 · no overflow at 400px in
either theme (400 === 400) · `tabular-nums` still on the version column · rendered `/` at
878 words.
