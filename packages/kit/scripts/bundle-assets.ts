/**
 * Copies the repo root's `skills/` and `templates/` into `dist/`, alongside `dist/kit.js`,
 * so `kit init` has its own copies once published — same reason `@ja3dan/tokens` bundles
 * `theme.css` into itself. Run before `bun build` in `package.json`'s `build` script; see
 * `src/assets.ts` for how `kit init` finds them at runtime, in both this published shape
 * and running from source inside the monorepo.
 */
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "..", "..");
const dist = join(import.meta.dir, "..", "dist");

mkdirSync(dist, { recursive: true });
for (const name of ["skills", "templates"]) {
  rmSync(join(dist, name), { recursive: true, force: true });
  cpSync(join(root, name), join(dist, name), { recursive: true });
}

console.log("Bundled skills/ and templates/ into dist/.");
