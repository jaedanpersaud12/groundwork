# Plan — 11 Show, don't tell (the landing page)

## What we're building

The "Two halves" section on `/` stops describing the two halves and shows one artefact from
each: the frontmatter of a real `skills/*/SKILL.md`, and the real `no-raw-colors` violation
— the offending class, the message the rule emits, and the token that replaces it. Both are
read at build time from the thing itself, so the page cannot drift from the repo. Sections
below the fold fade in once on scroll entry via `IntersectionObserver`, and the registry's
version column gets tabular figures.

## Decisions

- **The lint message is read from the plugin's rule metadata, not the file's text.**
  `@ja3dan/eslint-plugin` default-exports `{ rules: { "no-raw-colors": { meta: { messages }}}}`.
  Importing it and reading `meta.messages.palette` means a reworded message reaches the site
  on the next build, and a renamed rule throws rather than rendering a stale string. A regex
  over `index.js` would match the rest of `repo.ts`'s idiom but is brittle in exactly the
  way this section is supposed to disprove.
- **`@ja3dan/eslint-plugin` moves from `devDependencies` to `dependencies` in
  `apps/registry`.** Importing it from a server component makes it build-input, not tooling.
  It stays out of the client bundle because the section is a server component.
- **One skill, not the set.** The loop section further down already lists all the commands.
  The half above it shows the *form* of a skill — that it is a real file with frontmatter an
  agent reads — so the two sections answer different questions instead of repeating.
- **The reveal is CSS, armed by a small client component, not Motion.** `motion` is already
  a dependency, but it is the *registry components'* idiom (`lib/motion.ts`: CELL, ROLL,
  TURN, STILL) for interaction feedback. The site's own idiom is CSS (`animate-in` on the
  hero). One fade does not justify pulling Motion's runtime into the landing page, and the
  page stays a server component apart from one ~30-line leaf.
- **Hidden-by-default is scoped to `@media (prefers-reduced-motion: no-preference)`, plus a
  `<noscript>` escape.** `globals.css` already zeroes every transition under reduced motion
  globally — so a plain `opacity: 0` + class toggle would leave content *invisible* for
  anyone whose observer never fires. Scoping the initial hidden state to `no-preference`
  means reduced-motion users get fully-visible content with no transform and no JS
  dependency at all, and the `<noscript>` rule covers JS-disabled under `no-preference`.
  This is the one genuinely load-bearing detail in the feature.

## Assumptions

- Next 16 / Turbopack can import `@ja3dan/eslint-plugin` from a server module despite its
  `import contract from "@ja3dan/tokens/contract.json" with { type: "json" }` import
  attribute. **Unverified — this is the first thing to test, before any UI work.** If it
  fails, the fallback is to read `meta.messages` via a `node:vm`-free regex in `repo.ts`
  and accept the weaker guarantee, recording the downgrade in `log.md`.
- `skills/feature/SKILL.md`'s frontmatter is short enough to show whole. If it is not, show
  the frontmatter block only and the first line of the body, never a truncated sentence.

## How to build it

1. Prove the plugin import works from a server module. Stop and re-plan if it does not.
2. `repo.ts`: add `lintMessages()` returning the rule's own `meta.messages`, and
   `skillFrontmatter(name)` returning the raw `---` block `frontmatter()` already captures.
3. `kit.ts`: replace the `HALVES` prose `parts` with the artefact data for `/`. Leave the
   existing `HALVES` export intact for `/docs`, which is a later pass.
4. Build the two half-cards in `page.tsx` using the existing `SourceBlock`/`DataPlate`
   vocabulary from `_site/code.tsx` rather than new one-off markup.
5. Add `reveal` styles to `globals.css` and the `<Reveal>` client leaf; wrap the
   below-the-fold sections.
6. `tabular-nums` on the version column.
7. Verify every criterion in `spec.md`, writing evidence into `log.md` as each one lands.

## Out of scope

Everything in `spec.md`'s out-of-scope list, in particular `/docs` — including the false
`kit init` sentence found during the audit, which is recorded there so the docs pass
inherits it.
