import { setDefaultTimeout } from "bun:test";

/**
 * Tests drive the real shadcn CLI against a fixture registry; one `add` or dry run takes a
 * second or two, and an update runs several. Bun's 5s default kills the slower ones partway,
 * and only intermittently, depending on what else the machine is doing.
 *
 * Set here rather than as `timeout` in bunfig.toml: Bun 1.4.2 reads `[test] preload` from
 * bunfig but ignores a `timeout` key there without complaint. The `test` script also passes
 * `--timeout 60000`, because a slow test still occasionally died at ~5s with only this preload
 * in place, and the cause wasn't pinned down. Run the suite through `bun run test`.
 */
setDefaultTimeout(60_000);
