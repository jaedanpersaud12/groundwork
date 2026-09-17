# Progress

**Stage:** 14 — Tokens: three named radii and nav tints
**Last completed:** 13 — App UI doctrine
**Active feature:** none
**Next:** 14 — named radii and nav tint tokens (12's `/docs` pass still open)
**Blocker:** none

Keep this short. Detail belongs in the feature's own folder — `spec.md`, `plan.md`,
`log.md`, `review.md`. This file is the status block and the checklist, nothing else. The
version of it that grew to 450 lines is the reason the feature folders exist.

## Checklist

- [x] **01** Design registry, minimal version
- [x] **02** Agent kit scaffold — *08 was the first feature run through the loop end to
      end; `/feature finish` refused it once, on a criterion the branch really did fail*
- [x] **03** A first consuming project — *the signed-in screens' screenshots not verified
      against the real auth'd pages (no login available that session)*
- [x] **04** `packages/kit`: sync engine
- [x] **05** `packages/kit`: check and doctor
- [x] **06** `/kickoff` prompts, and `templates/`
- [ ] **07** retired — *not built, not going to be; 08 absorbed its job and no distinct one
      ever turned up, see build-plan*
- [x] **08** Groundwork site
- [x] **09** `packages/kit`: `kit init` — *proved end to end against a real throwaway
      project: `kit init` → the three kickoff prompts → a real feature 01 built and merged*
- [x] **10** `imprint`, and `ui-registry.md` with it — *promoted from "Later"; verified
      against a real composition that a registry item's own source leaves open*
- [x] **11** Show, don't tell — the landing page — *narrowed mid-build to `/` only; `/docs` is a
      separate pass, with its two findings held in the feature's spec*
- [ ] **12** Docs refresh, starting with setup
- [x] **13** App UI doctrine — *published in `@ja3dan/kit` 0.2.0*
- [ ] **14** Tokens: three named radii and nav tints
- [ ] **15** Dropdown, menu, dialog, alert dialog
- [ ] **16** App shell
- [ ] **17** Figures and controls
- [ ] **18** Skeletons and fixed-height tables

## Notes

- First commit landed and pushed to `origin/main`; all 18 skill symlinks stored as
  symlinks (mode 120000), 24 merge bases and the hook executable bits survived.
- The `better-*` vendored skills carry no licence file, so they are installed in
  `.agents/skills/` for local use only and are not in shippable `skills/`. `frontend-design`
  is Apache-2.0 and may be promoted when wanted.
