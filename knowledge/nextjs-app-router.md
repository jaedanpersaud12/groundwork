---
scope: stack
stack: [nextjs-16]
verified_version: next 16.3.5, react 19.2.8
verified_on: 2026-09-17
---

# Next.js App Router gotchas

- **Collapsing a menu in a `usePathname()` effect leaves the reader mid-page.** A mobile `<details>` nav in a persistent layout, closed by `useEffect(() => { ref.current.open = false }, [pathname])`: tapping a link 30 entries down landed on the new page at `scrollY 735` instead of 0. `<Link>` scrolls to the new Page's first element during navigation, measured while the open list still pushes it down; the effect then collapses the list and the content moves up under a scroll position that no longer matches. Close it in an `onClick` on the list (`event.target.closest("a")`), which runs before navigation — verified landing at `scrollY 0`. The ordering is inferred from the `scroll` section of `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`; the outcome was measured.
- **Route types go stale after moving routes, and don't exist after `create-next-app --skip-install`.** `next-env.d.ts` pulls in `.next/types/routes.d.ts`; after splitting routes into groups (`(site)`, `admin/(protected)`), `tsc` fails on `.next/types/validator.ts` still importing the old `page.js` paths, and with `--skip-install` there are no types at all, so the first `bun run check` fails on `Cannot find name 'LayoutProps'`. `rm -rf .next/types && bunx next typegen` fixes both. Verified next 16.3.5 in two projects.
- **A folder starting with `_` is private, not a route.** `app/_probe/page.tsx` compiles to nothing — a probe page placed there to test a build failure "passes" silently. Use a plain name. Verified next 16.3.5.
- **React 19's post-action form reset puts a native `<select>` back on its first option, ignoring a new `defaultValue`.** Text inputs pick up an echoed `defaultValue` after a `useActionState` round trip; selects don't. Return a per-submission counter from the action and key the select on it so it remounts. Verified react 19.2.8 with Next 16.3.5.
