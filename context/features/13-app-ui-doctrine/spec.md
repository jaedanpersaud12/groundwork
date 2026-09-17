# 13 App UI doctrine

## What

A shippable `app-ui` skill that states how a groundwork app's signed-in screens look and
behave, taken from the the reference CMS CMS: the sidebar shell and page header, instant navigation into
loading skeletons, radii and depth, fixed-height paged tables, icon row-action menus, CRUD in
modals with alert-dialog confirms, loading buttons, stat strips, panels and bar lists, value
pickers, motion and copy. The lifecycle skills and the template's `ui-rules.md` point to it,
so every project's agent reads it before building or reviewing an app screen.

## Why

The developer's instruction: groundwork must copy the reference CMS's design and components, and "it's
very important that the skill files remember these things". The registry already carries
some the reference CMS parts (table card, status pill, filter chip, pagination) but nothing tells a project
how to assemble a screen, so each one re-decides — a consumer project's admin built this week used top
tabs, text row buttons and full-page edit forms.

## Done when

- [ ] `skills/app-ui/SKILL.md` exists with frontmatter and sections for shell, page header,
      navigation/loading/errors, radii/depth, tables, row actions, modals, buttons,
      stats/panels, value pickers, motion and copy; every numeric value in it appears in the reference CMS
      source (spot-checked, listed in log.md)
- [ ] `/architect` homework, `/review` Layer 2 and 3, `/feature start` criteria guidance and
      `/imprint` Step 1 each reference `app-ui`
- [ ] `templates/next16-insforge/ui-rules.md` has an App Screens section pointing to it
- [ ] `.agents/skills/app-ui` symlink, `skills/README.md`, root `AGENTS.md` and the site's
      out-of-band skill list include it; the site build passes its skills cross-check
- [ ] `kit init` into a throwaway Next app installs `.claude/skills/app-ui/SKILL.md`
- [ ] Build plan has stages 14–18 for the tokens and components the skill names
- [ ] `bun run check` passes

## Out of scope

- The registry items themselves (14–18); the skill names them and says to build to spec until
  they ship
- Publishing a new `@ja3dan/kit` version to npm (developer's call)
- Reworking an existing consumer's admin to the doctrine (that project's own feature)
