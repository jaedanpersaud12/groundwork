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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
const hashOf = (item: Item) =>
  createHash("sha256")
    .update(JSON.stringify({ ...item, config: undefined, meta: { ...item.meta, version: undefined } }))
    .digest("hex");

let failed = false;
const index: Record<string, { version: string; hash: string }> = {};

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
  index[name] = { version, hash };
}

writeFileSync(join(out, "versions.json"), JSON.stringify(index, null, 2) + "\n");
if (failed) process.exit(1);
console.log(`Versioned ${Object.keys(index).length} items.`);
