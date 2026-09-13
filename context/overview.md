# What groundwork is

The shared starting point for every ja3dan project: a token contract, a lint rule, a
shadcn registry of components, and the agent kit that installs all of it into a new repo.

It exists because the same work kept being redone. Every project picked its own colours,
re-themed shadcn by hand, and rediscovered the same traps. The second project should be
cheaper than the first, and it wasn't.

## The two halves

**Design.** `packages/tokens` holds the contract — semantic token *names* and *roles*, with
values living in each project's theme. `packages/eslint-plugin` fails the build on anything
outside it. `apps/registry` serves components that projects copy in and own, versioned so
updates can merge with local edits.

**Agent kit.** `skills/` and `knowledge/` today; `packages/kit`, `templates/` and
`presets/` still to build. This is what makes a new repo start with the same context,
guardrails and loop rather than a blank `CLAUDE.md`.

## Who consumes it

| Project | Role |
| --- | --- |
| **jobpilot** | First consumer. The registry's first items and the `jobpilot` theme came from it. |
| **flvs** | Source of the table/filter family and most of the vendored design skills. |
| **bran** | Second consumer, for testing `kit sync` across more than one project. |

Groundwork also consumes itself: its own `.agents/skills/` are the skills it ships, so
using them here is the test of whether they're worth shipping.

## Precedence

When a project's local need and the registry disagree:

1. **The contract wins over a project's preference.** A component that needs a colour
   outside the contract is a contract conversation, not a local exception. Exceptions are
   how the lint rule becomes an allowlist of workarounds.
2. **A project's copy wins over the registry's, locally.** Installed components are owned
   by the project — that is the whole point of copying rather than importing. `kit sync`
   offers an update; it doesn't impose one.
3. **Evidence wins over both.** If the rule produces something visibly worse in a real
   app, that's a finding about the rule. Record it with `/harvest` rather than quietly
   working around it.

## Scope

Groundwork is a foundation, not a framework. It owns tokens, primitives, patterns and the
loop. It does not own product decisions, backend choices, or anything a single project
would be better off deciding for itself.

A component earns a place in the registry when a second project wants it. Until then it
belongs in the project that needed it.
