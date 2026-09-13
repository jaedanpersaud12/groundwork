---
scope: stack
stack: [nextjs-16]
verified_version: next 16.3.5
verified_on: 2026-09-13
---

# Next.js App Router gotchas

- **Collapsing a menu in a `usePathname()` effect leaves the reader mid-page.** A mobile `<details>` nav in a persistent layout, closed by `useEffect(() => { ref.current.open = false }, [pathname])`: tapping a link 30 entries down landed on the new page at `scrollY 735` instead of 0. `<Link>` scrolls to the new Page's first element during navigation, measured while the open list still pushes it down; the effect then collapses the list and the content moves up under a scroll position that no longer matches. Close it in an `onClick` on the list (`event.target.closest("a")`), which runs before navigation — verified landing at `scrollY 0`. The ordering is inferred from the `scroll` section of `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`; the outcome was measured.
