/**
 * Runs after `shadcn build`. For every built item, writes an immutable copy at
 * public/r/v/{name}@{version}.json, and fails if a published version's content
 * changed without a version bump. `kit sync` needs these copies as the base of a
 * 3-way merge when a project has edited its installed file.
 *
 * Also substitutes {{REGISTRY_URL}} so the setup item points projects at the registry they
 * were installed from: env REGISTRY_URL, else the Vercel production domain, else
 * http://localhost:3100. `app/_site/registry.ts` resolves it the same way, so the init
 * command shown on /docs and the URL written into setup.json agree.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

type Item = {
  name: string;
  files?: { content?: string }[];
  config?: unknown;
  meta?: { version?: string };
};

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, "public", "r");
const versionsDir = join(out, "v");
const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8")) as { items: Item[] };

const registryUrl = (
  process.env.REGISTRY_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3100")
).replace(/\/$/, "");

mkdirSync(versionsDir, { recursive: true });

// config holds the environment-specific registry URL, so it is not part of the content hash.
// packages/kit/src/registry.ts has a byte-compatible copy (hashItem) so kit's lock hashes match
// this file's; packages/kit/src/registry.test.ts fails if the two ever disagree. Change both.
const hashOf = (item: Item) =>
  createHash("sha256")
    .update(JSON.stringify({ ...item, config: undefined, meta: { ...item.meta, version: undefined } }))
    .digest("hex");

/** Numeric semver order, which is all the registry's versions need: `1.0.10` after `1.0.9`. */
const bySemver = (a: string, b: string) => {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

/**
 * Every published version of an item and its hash, read back from `public/r/v/`. kit needs
 * it to tell which past version a project has installed — the current `version` alone can
 * only say "not this one" — and nothing else lists what `v/` holds, since a static host
 * can't list a directory.
 */
function historyOf(name: string): Record<string, string> {
  const prefix = `${name}@`;
  return Object.fromEntries(
    readdirSync(versionsDir)
      .filter((file) => file.startsWith(prefix) && file.endsWith(".json"))
      .map((file) => file.slice(prefix.length, -".json".length))
      .sort(bySemver)
      .map((version) => {
        const published = JSON.parse(readFileSync(join(versionsDir, `${name}@${version}.json`), "utf8")) as Item;
        return [version, hashOf(published)];
      }),
  );
}

let failed = false;
const index: Record<string, { version: string; hash: string; history: Record<string, string> }> = {};

for (const { name } of registry.items) {
  const builtPath = join(out, `${name}.json`);
  const text = readFileSync(builtPath, "utf8").replaceAll("{{REGISTRY_URL}}", registryUrl);
  writeFileSync(builtPath, text);
  const built = JSON.parse(text) as Item;
  const version = built.meta?.version;
  if (!version) {
    console.error(`✗ ${name}: meta.version is missing`);
    failed = true;
    continue;
  }

  const hash = hashOf(built);
  const target = join(versionsDir, `${name}@${version}.json`);
  if (existsSync(target)) {
    const previous = JSON.parse(readFileSync(target, "utf8")) as Item;
    if (hashOf(previous) !== hash) {
      console.error(`✗ ${name}@${version} already published with different content. Bump meta.version.`);
      failed = true;
      continue;
    }
  } else {
    writeFileSync(target, JSON.stringify(built, null, 2) + "\n");
    console.log(`+ v/${name}@${version}.json`);
  }
  index[name] = { version, hash, history: historyOf(name) };
}

writeFileSync(join(out, "versions.json"), JSON.stringify(index, null, 2) + "\n");
if (failed) process.exit(1);
console.log(`Versioned ${Object.keys(index).length} items.`);
