---
scope: stack
stack: [insforge]
verified_version: "@insforge/cli 0.2.8, @insforge/sdk 1.5.2"
verified_on: 2026-09-17
---

# InsForge gotchas

- **`insforge create` rewrites `.gitignore` to ignore a bare `.claude`.** Its AI-tool block hides every file under `.claude/`, so skills installed by `kit init` after that point are never committed (and ones already tracked keep working, which hides the problem). Narrow it to `.claude/settings.local.json`; `kit doctor` flags the collision from kit 0.3.0. It also leaves `.env*` ignoring `.env.example` — add `!.env.example`. Seen in two projects.
- **`insforge db query` can't impersonate a role.** `SET ROLE`, `set_config('request.jwt.claims', …)` and transaction statements return `FORBIDDEN`, so RLS can't be exercised as `anon`/`authenticated` in SQL. Check grants with `has_table_privilege()` and row visibility with real SDK calls using the anon key or a signed-in session.
- **With `disable_signup = true`, users are added from the dashboard** — the SDK and CLI have no documented admin user-create. Grant a role afterwards with a row in your own `profiles` table.
