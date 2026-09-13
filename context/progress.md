# Progress

**Stage:** 05 — kit check and doctor
**Last completed:** 04 — kit sync engine
**Active feature:** none
**Next:** 05 (`packages/kit`: check and doctor), or 03 — jobpilot becomes the first consumer
**Blocker:** none

Keep this short. Detail belongs in the feature's own folder — `spec.md`, `plan.md`,
`log.md`, `review.md`. This file is the status block and the checklist, nothing else. The
version of it that grew to 450 lines is the reason the feature folders exist.

## Checklist

- [x] **01** Design registry, minimal version
- [x] **02** Agent kit scaffold — *08 was the first feature run through the loop end to
      end; `/feature finish` refused it once, on a criterion the branch really did fail*
- [ ] **03** jobpilot becomes the first consumer
- [x] **04** `packages/kit`: sync engine
- [ ] **05** `packages/kit`: check and doctor
- [ ] **06** `templates/`, `presets/`, `/kickoff`
- [ ] **07** `apps/site` — *on hold; 08 may have absorbed it, see build-plan*
- [x] **08** Groundwork site
- [ ] **09** `packages/kit`: `kit init` — *after 04 and 06*

## Notes

- `feat/06-kickoff` carries 06's spec and plan and is not merged. It is behind `main` and
  will conflict on this file's status block and on `build-plan.md`; rebase it before
  picking it up.
- First commit landed and pushed to `origin/main`; all 18 skill symlinks stored as
  symlinks (mode 120000), 24 merge bases and the hook executable bits survived.
- The `better-*` vendored skills carry no licence file, so they are installed in
  `.agents/skills/` for local use only and are not in shippable `skills/`. `frontend-design`
  is Apache-2.0 and may be promoted when wanted.
