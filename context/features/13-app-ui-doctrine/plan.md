# Plan — 13 App UI doctrine

## Decisions (confirmed by developer 2026-09-17)
- **Doctrine first, components after** — 13 is the skill and its wiring; 14–18 build items.
- **Nav tints become contract tokens** (`nav-1…8`, stage 14), not raw hex as in the reference CMS.
- **Hand-built skeleton kit** reusing real furniture, not boneyard-js.
- **Adopt the reference CMS's three named radii** (chip/control/surface), stage 14.

## Decisions (made while planning)
- **One skill, not several.** Rules reference each other (the skeleton reuses the table card;
  the row menu opens the modal); splitting them hides the connections.
- **Name registry items that don't exist yet** (`@ja3dan/dropdown`, `app-shell`, `stats`,
  `skeleton`, `table-pager`, `dialog`, `alert-dialog`, `segmented`, `tabs`,
  `loading-button`), with the instruction to build to spec and log it until they ship, so the
  skill doesn't need rewriting as 14–18 land.
- **Out-of-band on the site,** not part of the numbered loop — it's consulted, not run.
- **Public/marketing pages excluded**; they keep the template's `ui-rules.md`.

## Assumptions
- `kit init`'s `readSkills()` picks up any folder in `skills/` (bundle-assets copies the whole
  directory) — verify with a throwaway init against a local build.
