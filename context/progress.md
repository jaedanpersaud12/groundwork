# Progress

**Stage:** 04 — kit sync engine
**Last completed:** 08 — Groundwork site
**Active feature:** none
**Next:** 04 — kit sync engine (spec and plan already on `feat/04-kit-sync`)
**Blocker:** none

Keep this short. Detail belongs in the feature's own folder — `spec.md`, `plan.md`,
`log.md`, `review.md`. This file is the status block and the checklist, nothing else. The
version of it that grew to 450 lines is the reason the feature folders exist.

## Checklist

- [x] **01** Design registry, minimal version
- [x] **02** Agent kit scaffold — *08 was the first feature run through the loop end to
      end; `/feature finish` refused it once, on a criterion the branch really did fail*
- [ ] **03** jobpilot becomes the first consumer
- [ ] **04** `packages/kit`: sync engine
- [ ] **05** `packages/kit`: check and doctor
- [ ] **06** `templates/`, `presets/`, `/kickoff`
- [ ] **07** `apps/site` — *on hold; 08 may have absorbed it, see build-plan*
- [x] **08** Groundwork site
- [ ] **09** `packages/kit`: `kit init` — *after 04 and 06*

## Notes

- `feat/04-kit-sync` carries 04's spec and plan and is not merged; its progress.md will
  conflict with this one on the status block. Take whichever branch lands second.

- First commit landed and pushed to `origin/main`; all 18 skill symlinks stored as
  symlinks (mode 120000), 24 merge bases and the hook executable bits survived.
- The `better-*` vendored skills carry no licence file, so they are installed in
  `.agents/skills/` for local use only and are not in shippable `skills/`. `frontend-design`
  is Apache-2.0 and may be promoted when wanted.
