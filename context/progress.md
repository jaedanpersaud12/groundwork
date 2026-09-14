# Progress

**Stage:** 09 — `packages/kit`: `kit init`
**Last completed:** 09 — `packages/kit`: `kit init`
**Active feature:** none
**Next:** none — every buildable stage is done; 07 is retired, not built (see build-plan.md)
**Blocker:** none

Keep this short. Detail belongs in the feature's own folder — `spec.md`, `plan.md`,
`log.md`, `review.md`. This file is the status block and the checklist, nothing else. The
version of it that grew to 450 lines is the reason the feature folders exist.

## Checklist

- [x] **01** Design registry, minimal version
- [x] **02** Agent kit scaffold — *08 was the first feature run through the loop end to
      end; `/feature finish` refused it once, on a criterion the branch really did fail*
- [x] **03** jobpilot becomes the first consumer — *profile and find-jobs screenshots not
      verified against the real auth'd pages (no login available this session); see
      `context/features/03-jobpilot-consumer/log.md`*
- [x] **04** `packages/kit`: sync engine
- [x] **05** `packages/kit`: check and doctor
- [x] **06** `/kickoff` prompts, and `templates/`
- [ ] **07** retired — *not built, not going to be; 08 absorbed its job and no distinct one
      ever turned up, see build-plan*
- [x] **08** Groundwork site
- [x] **09** `packages/kit`: `kit init` — *proved end to end against a real throwaway
      project: `kit init` → the three kickoff prompts → a real feature 01 built and merged*

## Notes

- First commit landed and pushed to `origin/main`; all 18 skill symlinks stored as
  symlinks (mode 120000), 24 merge bases and the hook executable bits survived.
- The `better-*` vendored skills carry no licence file, so they are installed in
  `.agents/skills/` for local use only and are not in shippable `skills/`. `frontend-design`
  is Apache-2.0 and may be promoted when wanted.
