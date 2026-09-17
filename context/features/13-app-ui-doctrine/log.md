# Log — 13 App UI doctrine, from flvs

## 2026-09-17
- Developer: update groundwork so skill files remember flvs's design — icon row actions in a
  specific dropdown, sidebar/header styles/animations/spacing, instant page transitions,
  loading skeletons, fixed-width tables and pagination, improved analytics cards, modals for
  CRUD, clean modal design, "and many more". flvs doesn't use groundwork; it inspires it.
- Surveyed flvs: `components/admin/{AdminShell,AdminSidebar,nav,ui,skeleton,bones,filters,
  Segmented,TabbedPanel}`, `components/ui/{sidebar,dialog,alert-dialog,data-table,
  table-pagination}`, `components/interior/{dropdown,tabs,loading-button}`, products table,
  ambassador form dialog, dashboard, analytics metric strip, admin error/loading, globals.css.
- Plan decisions confirmed via questions (see plan.md).
- Wrote `skills/app-ui/SKILL.md` (12 sections). Wired into architect (homework), review
  (Layer 2 + 3), feature (spec criteria for app screens), imprint (Step 1), the template's
  `ui-rules.md` (App Screens), `.agents/skills/app-ui` symlink, `skills/README.md`, root
  `AGENTS.md`, and the site's `OUT_OF_BAND` list in `apps/registry/app/_site/kit.ts`.
- Build plan: stages 14–18 added (tokens; dropdown/menu/dialog/alert-dialog; app shell;
  figures and controls; skeletons and fixed-height tables). Progress checklist updated.
- `packages/kit/src/assets.test.ts` pinned exactly 7 skills and failed on 8 — updated to include
  `app-ui`. The failure itself confirmed `readSkills()` picks up the new folder.

## Evidence — done when
- **Skill sections + values traceable to flvs** — 33 values grepped in flvs `src/` and
  `app/globals.css`, each found ≥1 time: sidebar 16rem/18rem/3rem and "b" shortcut;
  `duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]`; `tracking-[0.16em]`; nav row
  `h-9 gap-3 rounded-control px-3 text-[13.5px]`; `strokeWidth={active ? 2 : 1.5}`; header
  `sticky top-0 z-20 flex h-14`; `p-4 sm:p-6 lg:p-8`; page header `sticky top-14`; row heights
  48/68/80; `ROWS_PER_PAGE = 10`; pager `h-[52px]`; dialog `p-5`, icon `size-9 … rounded-full
  bg-muted`, `space-y-3.5`, `mt-1 h-9`, hints `mt-1 text-[11px] text-muted-foreground`; sizes
  `sm:max-w-lg` / `sm:max-w-3xl` / `max-w-[min(88rem`; overlay `bg-black/25 duration-100
  …backdrop-blur-xs`; panel scroll `h-[19rem]`; stat `tracking-[.13em]`, `text-3xl leading-none
  tabular-nums`; radii 4/6/10px; skeleton `animate-pulse bg-foreground/10` and taper
  `w-4/5, w-3/5, w-2/3`; `scrollbar-gutter: stable`; destructive media `bg-destructive/10
  text-destructive`.
- **Skill references** — throwaway init: `grep -c app-ui` = 1 in each of review, architect,
  feature, imprint `SKILL.md`.
- **Template** — throwaway init's `context/ui-rules.md` line 38 "## App Screens" pointing to the skill.
- **Symlink / README / AGENTS / site** — `.agents/skills/app-ui -> ../../skills/app-ui`;
  `apps/registry` `bun run build` exit 0 (its skills cross-check throws on any skill missing
  from the site).
- **kit init installs it** — local `packages/kit` build (`dist/skills` lists app-ui), then
  `node dist/kit.js init next16-insforge` in a fresh create-next-app: "Installed 8 skills into
  .claude/skills/.", `.claude/skills/app-ui/SKILL.md` present with frontmatter, `kit.lock.json`
  skills include `app-ui`.
- **Stages 14–18** — in `context/build-plan.md` with done-when each.
- **check** — `bun run check` exit 0 (tokens, 62 kit tests + eslint tests, lint, registry:build
  "Versioned 24 items").

## Not done here
- `@ja3dan/kit` not republished to npm — existing projects (brian2) won't get `app-ui` from npm
  until it is. Developer's call.
