# Log — 08 Groundwork site

## The correction that reshaped the feature

The first build was a component-registry site: hero, tier groups, item pages. The
developer stopped it — groundwork bootstraps a project's skills, context and knowledge as
well as its design system, and the site described only the design system.

The miss was avoidable from inside the repo. `context/overview.md` opens with "the two
halves" and names the agent kit as one of them; `AGENTS.md` lists `skills/`, `knowledge/`
and `context/` in its map. The build worked from `AGENTS.md`'s one-line summary of the
registry instead of reading `context/overview.md` first. **Read the project's own overview
before designing anything that claims to describe the project.**

Second decision from the same conversation: `tracking-tight` on `body`, set in
`packages/tokens/base.css` so it reaches every groundwork project rather than this app
alone. Asked for as `tracking-tighter` (-0.05em) and revised to `tracking-tight`
(-0.025em) after seeing it.

## Evidence

- **Both halves are visible from `/`** — checked in the browser at 1470px, both themes.
  The landing runs plate → two halves → the loop as a numbered sequence → the `context/`
  tree → the component index. The `context/` tree is the section that makes "architecture
  before code" concrete; without it the claim is just a sentence.
- **Kit pages come from what the repo contains.** `app/_site/kit.ts` is the single source
  for the loop's stages and the `context/` tree, written from `skills/*/SKILL.md` and
  `context/features/README.md`. The landing page and `/docs/loop` render the same array,
  so they cannot drift into two descriptions of one thing.
- **23 item pages generated** — `next build` prerendered `/docs/components/[name]` for all
  23 (`● [+20 more paths]` after the three it names) plus six static pages. Not yet
  verified by adding a throwaway item and removing it, which is what the criterion asks
  for; the generation is from `registry.json` with no per-item file, so the risk is low
  but the check is still outstanding.
- **Item page content** — `/docs/components/button` checked in the browser: breadcrumb,
  title, description, the data plate (version 1.0.0 / Primitive / Minor and patch /
  1 file), live preview, install command, dependencies, source from `public/r/button.json`.
- **Hero legibility** — the plan's flat 55%/72% wash erased the illustration in dark. The
  layers were tuned live in the page and then written back: 46% wash in light, 50% in
  dark, a radial lift behind the words, and a bottom fade with late-weighted stops because
  a plain two-stop fade read as a hard edge. Checked in both themes.
- **Contract tokens only** — `bun run lint` clean with `no-raw-colors` over `app/**`. No
  rule disabled, no token added. The hero scrim is built from `--background` and the
  gradients live in `@utility` blocks in `globals.css`, which the rule does not police but
  which name only contract tokens.
- **`tracking-tight` reaches projects** — set on `body` in `packages/tokens/base.css`,
  which every project imports through the `setup` item. Visible on the registry's own
  component previews, since they render through the same stylesheet.
- **`bun run check`** — exit 0. Tokens generated and both themes validated, 16 lint-rule
  tests pass, eslint clean, registry build reports no item content change. `git status`
  after the build shows no modified file under `public/r/`, which is the check that this
  feature touched no registry item.
- **`bun run --filter registry build`** — clean. 32 pages prerendered.

## Not verified

- **400px.** The browser would not resize below 1470px in this environment, so the
  narrow-width criterion was audited statically instead: every fixed grid track is behind
  a `sm:`/`lg:`/`xl:` prefix, every flexible track is `minmax(0,1fr)`, code blocks and the
  wide table preview sit in `overflow-x-auto` wrappers, and below `sm` every layout is a
  single column. That is an argument, not a check. **Open.**
- **Adding and removing a throwaway registry item**, per the criterion above. **Open.**
- **Theme across a reload and a route change.** The inline script in `layout.tsx` runs
  before paint and `ThemeToggle` subscribes to the class through `useSyncExternalStore`;
  the toggle was exercised in the browser but the reload path was not. **Open.**
