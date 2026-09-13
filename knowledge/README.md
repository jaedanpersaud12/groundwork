# Knowledge

Gotchas — things that cost real time because a tool behaved differently than documented.
Written with `/harvest`, installed into new projects by kickoff according to their stack.

Not a documentation mirror. A note earns its place only when the docs are silent or wrong;
anything that restates the docs makes the rest less likely to be read.

## Files

| File | Scope | Stack | Verified |
| --- | --- | --- | --- |
| [shadcn-registry.md](shadcn-registry.md) | stack | `nextjs-16`, `tailwind-4`, `shadcn-4` | shadcn 4.21.0, 2026-09-13 |

## Format

Frontmatter says who the file is for and how stale it is:

```yaml
---
scope: stack          # project | stack | universal
stack: [nextjs-16, tailwind-4, shadcn-4]
verified_version: shadcn 4.21.0
verified_on: 2026-09-13
---
```

Then one bullet per gotcha: **a bolded claim that states the trap**, then the detail and
the workaround. The bold half has to carry the finding on its own, because that is the
part someone scanning twenty bullets actually reads.

`verified_on` is what tells a reader whether to trust the file or re-check it. Update it
whenever you confirm a bullet against the installed tool — and don't write an API example
from memory, since documentation drifting from reality is the exact problem these files
exist to fix.
