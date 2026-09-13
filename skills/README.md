# 🤖 Skills

The lifecycle skills a groundwork project gets. They're what turns "build this" into a
feature with a spec, a plan, evidence, and a review — and what stops it closing until the
evidence exists.

Groundwork uses them on itself: they're symlinked into [`.agents/skills/`](../.agents/skills),
so every feature here goes through the same loop a consumer's would.

## 🔁 In order

| | Skill | Does | Leaves behind |
| --- | --- | --- | --- |
| 1 | [`/feature start NN`](feature/SKILL.md) | Cuts the branch, writes the spec with "done when" criteria someone else could check | `spec.md` |
| 2 | [`/architect`](architect/SKILL.md) | Surfaces the decisions that change the build, and the assumptions not yet tested | `plan.md` |
| 3 | *build* | Decisions and evidence, written as they happen | `log.md` |
| 4 | [`/review`](review/SKILL.md) | Cheap checks first, then a subagent that sees only the spec, plan, diff and rules | `review.md` |
| 5 | [`/feature finish`](feature/SKILL.md) | **Refuses to close** while any criterion lacks evidence; then harvests and opens the PR | the PR |

Everything lands in `context/features/NN-slug/`, beside the code it describes.

## ⚡ When needed

| Skill | Runs when |
| --- | --- |
| [`/remember`](remember/SKILL.md) | A feature spans sessions — `save` at the end, `restore` at the start |
| [`/recover`](recover/SKILL.md) | A problem survives one fix. Diagnose which kind of failure it is before prompting again |
| [`/harvest`](harvest/SKILL.md) | A tool behaved differently than documented. Writes it to [`knowledge/`](../knowledge) |

## The rule with teeth

A criterion closes with a line saying how it was checked — browser, script, SQL, test — or
an explicit *"not verified, because …"*. Silence doesn't close it. That second form is a
perfectly good answer; the point is that skipping the check is harder than remembering it.

## Format

Each skill is a folder with a `SKILL.md`:

```markdown
---
name: review
description: One or two sentences an agent uses to decide when to run it.
---

The instructions.
```

The `description` is also what [the site](https://gw.jaedan.me/docs/loop) shows, read at
build time — so rewriting a skill updates its docs on the next deploy.
