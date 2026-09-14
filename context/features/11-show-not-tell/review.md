# Review — 11 Show, don't tell (the landing page)

_Reviewed 2026-09-14 against spec.md and plan.md, by a subagent that saw only the spec, the
plan, the log, the diff and the project rules._

## Layer 1 — Spec alignment
**ISSUES**

- [x] **Artefacts read from source** — met in code. `lintMessage` reads
      `plugin.rules["no-raw-colors"].meta.messages`; `skillFrontmatter("feature")` returns
      the verbatim block. But the criterion asks for "changing each source, rebuilding, and
      recording that the page changed with it", and the log records only the *deletion*
      half plus a lint probe that proves a different thing. The reword-reaches-the-page half
      was argued structurally, never demonstrated. Sound argument, but the log claimed more
      than it showed. And one number in that section is not read from disk at all —
      Finding 1.
- [x] **Rendered copy shorter** — met, 930 → 879. Baseline confirmed comparable: `page.tsx`
      and `kit.ts` are byte-identical between `e62791d` and `d06e3a9`.
- [x] **Fade on scroll entry; visible under `reduce`; visible with JS off** — met for the
      three states the spec names, by the right method. The state set is not exhaustive —
      Finding 2.
- [x] **Tabular figures** — met.
- [ ] **`check`, typecheck, build pass** — claimed exit 0; not re-verified in a read-only
      review, since `bun run check` regenerates token output.
- [ ] **No overflow at 400px** — claimed with the right method; not re-verified. New markup
      is consistent with it.
- [ ] **"adds no runtime dependency"** — **not met as written.** `@ja3dan/eslint-plugin`
      moved into `dependencies`. The plan decided this deliberately and the log reframed it;
      the criterion should have been amended in the same edit that narrowed the spec, and
      was not. The move is benign; the bookkeeping was not.
- [x] **No `packages/tokens/` file, font, icon or colour** — met.

**Scope creep:** none material.

## Layer 2 — System integrity
**ISSUES**

Every invariant in both `AGENTS.md` files checked individually. `registry/**`,
`registry.json` and `public/r/**` untouched; generated token files untouched; contract
tokens only; registry-import and example rules N/A for `app/**`. Existing patterns reused —
except Findings 1, 5 and 6.

On `@ja3dan/eslint-plugin` in `dependencies`: smaller downside than it looks. `apps/registry`
is `"private": true` so nothing is published; it cannot reach the client bundle because
`repo.ts` also imports `node:fs`. The one real cost is that the module now has two consumers
with different lifetimes — `eslint.config.mjs` and the Next server graph — so a future
eslint-only import inside the plugin would break the site build.

## Layer 3 — Production readiness
**ISSUES**

The reduced-motion scoping is correct, and correct for the right reason: `reduce` is served
by the *absence* of a rule rather than an override. Specificity holds without relying on
source order. Browsers not understanding the media feature drop the block and get visible
content — the safe direction. `:has` is not used.

Anchor scrolling and the header were verified independently rather than taken from the log:
`scroll-mt-20` is still on the `<section>`, the wrapper is a plain block div, and on `/` the
header is `absolute` inside the unwrapped hero, so the transform-containing-block
interaction cannot arise.

The three-state table is nonetheless incomplete — Finding 2.

## Findings

### Critical

1. **`THEME_COUNT = 2` is hardcoded in the one section whose premise is that it cannot be.**
   `kit.ts`, rendered as `43 tokens · 2 themes · …`. Correct today; silently false the moment
   a third theme lands, which `build-plan.md`'s "Later" list explicitly plans. That is the
   exact failure mode the feature exists to eliminate, inside the feature's own headline
   section. `repo.ts` already reads directories off the repo root and `kit.ts` already
   carries four "out of step with disk" guards — neither was used. The log compounds it by
   claiming "every number computed from disk" while enumerating only the two that are.

### Important

2. **The reveal is fail-closed, and the fourth state is the one that bites.** With motion
   allowed and JS enabled, the only hidden→visible path is `Reveal`'s effect. A client chunk
   404 after a deploy, a CSP or extension blocking the bundle, or an error during hydration
   leaves four of five sections permanently invisible. `<noscript>` does not help — it
   applies only when scripting is disabled. No error boundary, no failsafe, no CSS recovery.
3. **The `bg-blue-500` specimen passes lint by accident of the tokeniser.** The file *is*
   linted; the literal survives only because `checkText` splits on whitespace and
   `className="bg-blue-500` fails `COLOR_UTILITY`'s leading anchor. Any plausible
   improvement to the rule turns `bun run check` red on the file that demonstrates the rule.
   Nothing declares the exemption.
4. **`build-plan.md` stage 11 and `spec.md` disagree, and only one is checked.** The build
   plan still requires `/docs` word counts and the `kit init` correction; the spec dropped
   both. `/feature finish` reads the spec, so stage 11 would be ticked against a build-plan
   criterion that is not met.
5. **`LintFailure` gives screen-reader users no way to tell the wrong line from the right
   one.** The `-`/`+` glyphs are `aria-hidden`, leaving colour as the only distinction. Not a
   1.4.1 failure (the glyphs render for sighted users) — a 1.3.1 one.

### Minor

6. **`EVIDENCE` and `HALVES` are two independent descriptions of the same two halves**, with
   no guard tying them. Expected while `/docs` is deferred, but the divergence starts now.
7. **A renamed `skills/feature/` fails with a raw `ENOENT` and takes down five routes**,
   because `readSkill("feature")` runs before `kit.ts`'s own SKILLS-drift guard. Pre-existing
   pattern; this feature adds one more trigger. `SPECIMEN` is not validated against
   `skillNames()`, unlike every other cross-check in the file.
8. **`OFFENDING_CLASS`'s regex is positional and fails open.** An attribute before
   `className` would silently quote the wrong token.
9. **Printing `/` prints four blank sections** — `@media print` does not reset the motion
   preference.
10. **The observer mutates an attribute React owns.** Safe today (stateless component,
    server parent), but a re-render resets it after `disconnect()`. Bites on Fast Refresh.
11. **`lintMessages()` is exported with no consumer outside the file.** Dead export.
12. **`LintFailure` has no `CopyButton`** though it sits beside `SourceBlock`, which has one.
