---
scope: stack
stack: [bun]
verified_version: bun 1.4.2
verified_on: 2026-09-17
---

# Bun gotchas

- **`bunfig.toml`'s `[test] timeout` key is silently ignored.** Bun 1.4.2 accepts it without complaint but never applies it — a test that should be killed at the configured timeout still dies at the 5s default. Set the timeout in code instead: `setDefaultTimeout(ms)` from `bun:test`, called in a script listed under `[test] preload` in `bunfig.toml`. Verified: a 6s probe test timed out at ~5,000ms with only the `bunfig.toml` key set, and passed once `setDefaultTimeout` ran via preload.
- **`require.resolve("<pkg>/package.json")` works under `bun test` but fails once the code runs under plain Node**, with `ERR_PACKAGE_PATH_NOT_EXPORTED`, whenever the package's `exports` map doesn't list `package.json` (many CLIs, including shadcn, don't). Bun resolves it anyway; Node enforces the exports map strictly. This only surfaces when you actually run the built output with `node dist/x.js` — the Bun test suite passes regardless. If a Bun-authored tool ships to run under Node, resolve the package via its declared `.` export (e.g. the same file its `bin` points at) instead of reaching for `package.json` directly.
- **`bunx` fails with `EPERM` under a file sandbox before the package even runs**, because it writes to the system temp and install cache first. Point both at a writable directory: `TMPDIR=/tmp BUN_INSTALL_CACHE_DIR=/tmp/bun-cache bunx …`. Reported by an agent in a sandboxed harness; the cause is the default temp dir, not the registry.
- **`bun publish` prints `+ pkg@version` even when npm only *staged* the publish.** The version didn't appear in `npm view --prefer-online`; a second publish returned `409 Cannot publish over previously staged version`. The staged version went live later without further action. Check `npm view <pkg> versions --prefer-online` before publishing anything that depends on it. Verified bun 1.4.2, npm 11.12.1.
- **`workspace:*` dependencies are rewritten to the sibling's version at publish** — so a package whose sibling was bumped in the repo but never published installs broken (`No version matching "0.2.0"`). Publish dependencies first, and inspect the packed `package.json` (`bun pm pack`, then `tar xzf … -O package/package.json`). Verified bun 1.4.2.
