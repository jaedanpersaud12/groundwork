---
scope: stack
stack: [bun]
verified_version: bun 1.4.2
verified_on: 2026-09-13
---

# Bun gotchas

- **`bunfig.toml`'s `[test] timeout` key is silently ignored.** Bun 1.4.2 accepts it without complaint but never applies it — a test that should be killed at the configured timeout still dies at the 5s default. Set the timeout in code instead: `setDefaultTimeout(ms)` from `bun:test`, called in a script listed under `[test] preload` in `bunfig.toml`. Verified: a 6s probe test timed out at ~5,000ms with only the `bunfig.toml` key set, and passed once `setDefaultTimeout` ran via preload.
- **`require.resolve("<pkg>/package.json")` works under `bun test` but fails once the code runs under plain Node**, with `ERR_PACKAGE_PATH_NOT_EXPORTED`, whenever the package's `exports` map doesn't list `package.json` (many CLIs, including shadcn, don't). Bun resolves it anyway; Node enforces the exports map strictly. This only surfaces when you actually run the built output with `node dist/x.js` — the Bun test suite passes regardless. If a Bun-authored tool ships to run under Node, resolve the package via its declared `.` export (e.g. the same file its `bin` points at) instead of reaching for `package.json` directly.
