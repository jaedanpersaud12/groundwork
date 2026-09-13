# 06 — `/kickoff`: the prompts that write a project's context

## What

Three prompts, shipped as plain markdown in `prompts/`, that take someone from "I have an
idea" to a repo whose `context/` is as specific as jobpilot's — without assuming they use
Claude Code, or any tool at all.

- **`01-interview.md`** — interviews across several turns, then writes `project-overview.md`
- **`02-architecture.md`** — takes the overview, asks only what changes the build, proposes
  the data model, writes `architecture.md`
- **`03-build-plan.md`** — takes both, writes `build-plan.md` as numbered features

Plus `templates/next16-insforge/` — the files that are *copied*, not generated:
`code-standards.md`, `ui-rules.md`, an empty `library-docs.md` with its discipline header,
a short `progress.md`, and the `features/` folder.

## Why

Groundwork's premise is that the second project is cheaper than the first. Today the thing
that actually makes jobpilot cheap to work on — 3,774 lines of context that say exactly
which columns exist, which folders own what, and what is deliberately not being built —
exists in precisely one repo and was written by hand.

Every other project starts from a blank `CLAUDE.md`, which means every session re-derives
the architecture from the code and gets it slightly differently each time. The context is
the product. The registry is the easy half.

## Decisions taken before the spec

- **Plain prompts, any LLM.** Copy-pasteable markdown, not skills and not a CLI. Someone
  in Cursor or ChatGPT gets the same thing a kit user does. The cost is that no stage can
  run a command or read `node_modules`, which is what pushes `library-docs.md` out of
  kickoff entirely.
- **Three generation stages, one copy step.** Each stage's output is the next stage's
  input, pasted in — the same argument that put feature plans in files instead of chat. A
  single prompt was the original design and it was wrong: roughly half of jobpilot's
  context either isn't knowable at kickoff or has to be read out of installed packages.
- **`library-docs.md` ships empty.** It is project-scoped `knowledge/` — same discipline,
  same `verified_version` / `verified_on` frontmatter, and `/harvest` promotes a note from
  one to the other. Filled on first use of each library, never from model memory, because
  "documentation drifting from reality" is the exact failure it exists to prevent.
- **No `ui-registry.md` in the template.** jobpilot's is genuinely useful and jobpilot had
  an `imprint` skill to maintain it. Groundwork doesn't. Shipping a living document with
  nothing that writes to it reproduces the 450-line-tracker failure in a new shape, so it
  is left out and recorded below as a candidate feature.
- **Proven by re-deriving jobpilot and diffing**, not by reading the output and nodding.

## Done when

- [ ] `prompts/01-interview.md`, run against jobpilot answering as its developer would,
      produces a `project-overview.md` that a line-by-line diff against the real file shows
      to contain: all 6 pages, the profile-vs-research data-ownership rule, all 4 PostHog
      events, a features-out-of-scope list of at least 15 items, and success criteria
- [ ] `prompts/02-architecture.md`, given jobpilot's **real** `project-overview.md`,
      produces an `architecture.md` containing a stack table, folder structure with
      per-folder ownership, at least 3 data-flow diagrams, a schema with per-column tables,
      and an invariants list — diffed against the real file
- [ ] `prompts/03-build-plan.md`, given jobpilot's real overview and architecture, produces
      numbered features in phases, each with the UI/Logic split
- [ ] The three run **end to end** from a cold start on jobpilot, and the compounding drift
      is written down — where stage 3's output degrades because stage 1's was imperfect
- [ ] Every interview stage refuses to accept a vague answer: asked "what's out of scope?",
      a reply of "not much" produces another question, not a shrug. Demonstrated in the log
- [ ] `templates/next16-insforge/` contains the five copied files, with every jobpilot
      specific fact removed — verified by grepping the template for `jobpilot`, `Adzuna`,
      `InsForge`, `Browserbase` and finding only stack-level mentions
- [ ] A reader following `/docs` alone can get from nothing to the three prompts and knows
      what each produces before running it
- [ ] `bun run check` passes

## Out of scope

- **`kit init`** — the deterministic half (copy templates, install skills, run installs).
  It needs `packages/kit` to exist, which is 04 and 05.
- **`imprint` and `ui-registry.md`.** A living UI registry needs a skill that maintains it;
  that is its own feature, and the build plan should gain a line for it.
- **More than one preset.** `next16-insforge` comes from jobpilot. A second preset is only
  worth designing against a second real project.
- **Taking a throwaway project all the way to feature 01 merged.** That is the build plan's
  criterion for 06 and it assumes the CLI half exists. It moves to whichever feature
  finishes `kit init`.
- **Generating `code-standards.md` or `ui-rules.md`.** They are copied and parameterised.
  Generating house style per project is how house style stops being house style.
