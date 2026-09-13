# Progress

**Stage:** 02 — Agent kit scaffold
**Last completed:** 01 — Design registry, minimal version
**Active feature:** none
**Next:** 03 — jobpilot becomes the first consumer, or 04 — kit sync engine
**Blocker:** none

Keep this short. Detail belongs in the feature's own folder — `spec.md`, `plan.md`,
`log.md`, `review.md`. This file is the status block and the checklist, nothing else. The
version of it that grew to 450 lines is the reason the feature folders exist.

## Checklist

- [x] **01** Design registry, minimal version
- [x] **02** Agent kit scaffold — *one criterion open: no feature has been run through the
      loop end to end yet, which is the actual test of it*
- [ ] **03** jobpilot becomes the first consumer
- [ ] **04** `packages/kit`: sync engine
- [ ] **05** `packages/kit`: check and doctor
- [ ] **06** `templates/`, `presets/`, `/kickoff`
- [ ] **07** `apps/site`

## Notes

- The repo has no commits yet. Several things that look like drift (`registry-drift`
  staying silent, every file reading as untracked) are that, and resolve at the first
  commit.
- The `better-*` vendored skills carry no licence file, so they are installed in
  `.agents/skills/` for local use only and are not in shippable `skills/`. `frontend-design`
  is Apache-2.0 and may be promoted when wanted.
