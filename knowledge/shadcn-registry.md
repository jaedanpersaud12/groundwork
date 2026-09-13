---
scope: stack
stack: [nextjs-16, tailwind-4, shadcn-4]
verified_version: shadcn 4.21.0
verified_on: 2026-09-13
---

# shadcn registry gotchas

- **`init --base` takes `base`, not `base-ui`.** `shadcn init -d --base base` (values: `radix | base | aria`). Some docs and skills say `base-ui`; 4.21 rejects it.
- **`meta` survives `shadcn build`.** Put `version`, `tier`, `track` there; `apps/registry/scripts/version-registry.ts` reads it.
- **A `registry:base` item with `"extends": "none"` replaces shadcn's defaults on init.** `shadcn init <url>/r/setup.json` writes our CSS imports, our `lib/utils`, and the item's `config` (including `registries`) into `components.json`, without shadcn's `:root`/`.dark`/`@theme` token blocks.
- **`init` still creates shadcn's own `components/ui/button.tsx`.** Follow with `shadcn add @ja3dan/button --overwrite`.
- **`add` with a plain `css` `@import` on an already-initialised project leaves shadcn's token blocks below the imports**, and those later declarations win. New projects must use `init <setup>`; existing ones need the old blocks removed by hand.
- **create-next-app's template CSS survives init.** Its `:root { --background; --foreground }`, dark media query and `body { font-family: Arial }` override the theme. Replace `app/globals.css` with the setup imports.
- **Import rewriting:** registry files import `@/lib/utils` and `@/registry/<style>/{ui,lib,hooks}/<name>`; install rewrites them to the project's `utils`, `ui`, `lib` and `hooks` aliases (verified for all four). A `registry:block` file typed `registry:component` lands in `components/`. Keep a block in one file — cross-file imports inside `blocks/` were not tested.
- **shadcn's calendar defines `Root`, `Chevron`, `DayButton` and `WeekNumber` inline.** Every parent re-render remounts the whole month grid (focus lost, enter animations replay — e.g. after the first click of a range). Ours hoists them to module level and passes locale through context.
- **Base UI `Menu.Trigger` opens on pointerdown.** Browser-automation clicks and synthetic `.click()` don't open it; dispatch a `pointerdown` in tests. `Popover.Trigger` does open on click.
- **Cross-item dependencies use the namespace:** `"registryDependencies": ["@ja3dan/button"]`. A bare `"button"` resolves to shadcn's official button.
- **A `"use client"` module's non-component exports are opaque to Server Components.** Exporting an object of JSX examples and indexing it from a server page yields nothing; export a client component that does the lookup.
