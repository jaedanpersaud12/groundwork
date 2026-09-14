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

### One more, caught by lint after the review fixes

Moving `Reveal` to `useState` put a synchronous `setShown(true)` in the effect body for the
no-`IntersectionObserver` branch, which `react-hooks/set-state-in-effect` rejects. A
`bun run check` run earlier in this round reported exit 0 even though this code was already
in place; a later run failed on it. Re-running confirmed `check` does propagate a registry
lint failure (root `lint` exit 1, `check` exit 1), so the gate itself works — the earlier
green run is not trusted as evidence, and only the final run below is. Fixed by deferring
that one `setShown` a tick with a cleared `setTimeout`.

### Final state

`bun run check` exit 0 · `typecheck` exit 0 · `build` exit 0. Five reveal states re-run
after the last `reveal.tsx` change, same results as the table above; no overflow at 400px
in either theme; `tabular-nums` intact. (Verified against an already-running dev server on
:3002 rather than :3100 — a second `next dev` in the same directory refuses to start.)

## Harvested

Two entries added to `knowledge/browser-verification.md`: the Browser pane delivers no
`IntersectionObserver` callbacks in the same state it delivers no `requestAnimationFrame`,
so scroll-reveal cannot be verified there at all; and blocking `_next/static/chunks/**` to
simulate a failed bundle also blocks Next's stylesheet, which makes any
"is the content still visible" check pass for the wrong reason.

---

## Finding for the registry, not fixed here: Pagination hydration mismatch under reduced motion

Rendering `@ja3dan/pagination` in a page viewed with `prefers-reduced-motion: reduce` logs a
React hydration mismatch: the server renders each page number's `motion.span` at
`opacity: 0` / `translateX(8px)`, the client at `opacity: 1` / `transform: none`
(`registry/groundwork/ui/pagination.tsx`, around line 122, where the reduced-motion branch
is read). Found by the redesigned landing page, which put Pagination in its specimen sheet.
It is a shipped component, so the fix needs a `meta.version` bump and a `registry-review`
pass; the landing page dropped Pagination from the specimen instead of carrying the
mismatch. The same example on `/docs/components/pagination` should show it too.

## /better-layout review of the redesign

Stress-tested in headless Chromium: widths 320, 400, 720 (200% zoom of 1440), 768, 900,
1024, 1280, 1440, 1920; `dir="rtl"` at 400 and 1440; pseudo-localised copy (+40%, accented)
at 400, 1024, 1440. Every run: no page overflow, no child escaping its parent, header on
one line, and at 1440 the subgrid rows hold (both halves' file panels and links share a
top; the loop's titles and footers share a top; block captions share a top per row), with
pseudo-localised copy too.

Fixed: links in the index and block captions now carry a resting underline (they read as
static text before); arrows mirror under RTL (`scale: -1 1`, checked); 12px between the
Save/Cancel buttons and 24px between the header's toggle and link; block captions wrap;
the status-pill group no longer has an English-width cap. Not fixed, LOW: the shared
`Command` field clips long commands with no fade on narrow screens (a docs-wide component);
no `env(safe-area-inset-*)` on the landing header.

## The night triptych

Three portrait paintings (added to `apps/registry/public/` by the developer) close the page
as a triptych under the two commands: the page opens on a valley in daylight and ends on
three shorelines at night. Each crop is positioned to keep its figure in frame; on phones
the row becomes a scroll-snap scroller with a 32px peek (measured: items at 16, 368, 720 in
a 400px viewport).

## Tighter rhythm; paintings set into sections instead of a triptych

Developer feedback: sections too far apart, and the triptych read as images dropped onto
the page. Sections went from 96-128px padding each side (192-256px between) to 56-64px
(112-128px between), still 2x the 56px from a section's opening to its content. The
triptych is gone. Two paintings are now set into sections through one `Plate` treatment:
same radius as the panels, height taken from the panels beside it, landscape crop above
the content on narrow screens. The loop became a vertical list beside the cove painting (a
figure on a curving shoreline); the two commands stack beside the cliff painting (a figure
at the shore facing a path of light). The third painting (`HR0LFOMbEAAIpyI.jpeg`) is not
used.

A stress re-run caught a regression before commit: the rebuilt command panels had lost
`grid-cols-1`, and the implicit track grew to the command's width (490px in a 400px
viewport). Fixed; all nine widths, RTL and pseudo-localised runs are clean again.

## kit init and context generation on the landing page

Developer feedback: the page never explained `kit init` or how a project's context gets
written. New section "How a project starts", between the two halves and the loop:

- **Run kit init**: the command and what it writes, every line read from source:
  `context/` (template file count from `templates/next16-insforge`), `.claude/skills/`
  (skill count), `components.json`, and the lock file name parsed from
  `packages/kit/src/lockfile.ts`.
- **Run the kickoff prompts**: each prompt paired with the file it writes and what that file
  holds, parsed from `PROMPT_NOTES`, so a renamed output fails the build.

The loop section now reads as the step after ("Then every feature takes the same path"),
the hero's command is `kit init`, and the close offers the whole kit or only the design
system.

**Not publishable yet:** `@ja3dan/kit` returns 404 on npm. The page's
`bunx @ja3dan/kit init next16-insforge` will not run for a visitor until the kit is
published. `/docs/kickoff` also still calls `kit init` unbuilt (docs pass).

Page-wide, values snapped to the landing-page-design skill's scales: arbitrary font sizes to
Tailwind steps, spacing to its table (56px to 48px, 112px to 96px, 20/10/6px snapped), the
header moved into the flow so the hero needs no 176px top padding, and the scroll reveal
became a 4rem rise through a 12px blur over 800ms on cubic-bezier(0.32,0.72,0,1). The five
reveal states re-verified with the blur (all end visible and sharp). Stress suite clean at
all nine widths, RTL and pseudo-localised, after fixing two more implicit grid tracks.

## Applying the landing-page-design skill (supplied by the developer)

Taken, where the token contract allows:
- **Geist and Geist Mono** replace Archivo and IBM Plex Mono site-wide (root layout), weights
  capped at semibold. `type-display` lost its width axis and custom line height; it now
  takes the type-scale step's line height and tracks tight.
- **Hero heading**: capped at 680px, broken after "last", with a left-to-right text gradient
  built from contract tokens (`from-foreground to-muted-foreground`), which lands on the
  skill's greys in both themes without a raw colour.
- **Tagline reveal**: "Every project you finish / makes the next one / cheaper to start.",
  each word lighting from 30% to full as it crosses a line 60% down the viewport, staggered
  within a batch. Verified: all 11 words muted before arrival, `11110000000` as the first
  line crosses, all lit after; full colour throughout under `reduce` and with JS off; with
  the bundle blocked it starts muted and the inline failsafe restores it.
- **Island nav**: floating glass pill 24px from the top; on narrow screens the menu button's
  two lines rotate into an X and open a full-screen glass dialog with links rising in
  sequence. Verified: focus moves to the first link, body scroll locks, Escape closes and
  returns focus to the button. The page had no navigation on phones before this.
- **One motion curve**: `ease-fluid` (cubic-bezier(0.32,0.72,0,1)) as a theme token, used by
  every landing transition; the reveal is 800ms.
- Spacing and type scales (previous entry).

Not taken, because they conflict with a repo invariant or need decisions the developer owns:
- Dark-mode background hexes and hex heading gradients: raw colours fail `no-raw-colors`;
  theme values belong to the token contract (`/token-change`).
- Phosphor icons: the shipped registry components use lucide, so swapping the page's icons
  would put two icon families on one page.
- FAQ, proof strip, risk reversal, legal links, branded 404, og:image: content and pages
  that need real answers from the developer, not invented copy.

## Two halves, redesigned

Developer feedback: the two identical cards read as generated. The section is now one panel
split at a seam: both halves on the same surface, a larger heading with its link on the same
line, one sentence, then a window onto a real file that runs off the half's bottom and
trailing edges (only its top leading corner rounded), so it reads as a view into the file.
The kit's window shows the first 18 lines of `skills/feature/SKILL.md`; the design system's
shows the violation, the rule's message, the fix and a clean result. Rows are shared through
subgrid, so both windows start on one line.

Two iterations dropped on feedback: a round "+" join mark on the seam (read as decoration),
and alternating tones between the halves (read as two different things, not two halves).

## How a project starts, redesigned

Developer feedback: the two step cards read as generated, and the glass nav let the heading
show through. The section is now the three steps as a plain list with large numerals
(including step 3, `/feature start 01`) beside one tree of the project they produce, in
editor order (folders first, then files by name), each file tagged with the step that wrote
it and what it is for. Pointing at, focusing or pressing a step lights that step's files and
quiets the rest (verified: step 2 lights exactly architecture.md, build-plan.md,
project-overview.md); the tree stays complete without JavaScript. Tree contents are read
from the preset, the prompt notes and the lock file name; the globals.css,
eslint.config.mjs and package.json lines are what init.ts does. Nav glass raised from 70%
to 85% opacity.

The stress suite caught one more implicit grid track (step content at 320px); fixed before
commit. All nine widths, RTL, pseudo-localised, console, reveal states and `bun run check`
clean.
