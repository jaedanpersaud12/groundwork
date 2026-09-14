# Progress

**Stage:** 09 — `packages/kit`: `kit init`
**Last completed:** 06 — `/kickoff` prompts, and `templates/`
**Active feature:** 09 — `packages/kit`: `kit init` (`feat/09-kit-init`)
**Next:** none — 09 is the last numbered stage on the board
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
- [ ] **07** `apps/site` — *on hold; 08 may have absorbed it, see build-plan*
- [x] **08** Groundwork site
- [ ] **09** `packages/kit`: `kit init` — *spec on `feat/09-kit-init`; open question is
      where skills/templates come from at init time — bundled in the npm package, or
      fetched from GitHub the way jobpilot's `skills-lock.json` does*

## Notes

- First commit landed and pushed to `origin/main`; all 18 skill symlinks stored as
  symlinks (mode 120000), 24 merge bases and the hook executable bits survived.
- The `better-*` vendored skills carry no licence file, so they are installed in
  `.agents/skills/` for local use only and are not in shippable `skills/`. `frontend-design`
  is Apache-2.0 and may be promoted when wanted.
