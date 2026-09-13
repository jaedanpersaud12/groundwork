/**
 * Runs after `shadcn build`. For every built item, writes an immutable copy at
 * public/r/v/{name}@{version}.json, and fails if a published version's content
 * changed without a version bump. `kit sync` needs these copies as the base of a
 * 3-way merge when a project has edited its installed file.
 *
 * Also fails a new major version that carries no migration note for itself in
 * `meta.migrations`. `kit sync update` shows those notes instead of merging a major
 * silently, so a major without one would reach a project with nothing to say.
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
  meta?: { version?: string; migrations?: Record<string, unknown> };
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

/**
 * `meta.migrations` maps a version to its note. A new version whose major is higher than any
 * version already published must carry a note for itself; earlier notes stay in later
 * versions so an update that crosses several majors can show every one. A first release has
 * nothing to migrate from and is exempt.
 */
function migrationProblem(name: string, version: string, built: Item): string | null {
  const migrations = built.meta?.migrations;
  if (migrations !== undefined) {
    if (typeof migrations !== "object" || migrations === null || Array.isArray(migrations)) {
      return `${name}@${version}: meta.migrations must be an object of version → note.`;
    }
    for (const [key, note] of Object.entries(migrations)) {
      if (!/^\d+\.\d+\.\d+$/.test(key)) return `${name}@${version}: meta.migrations key "${key}" isn't a version.`;
      if (typeof note !== "string" || !note.trim()) return `${name}@${version}: meta.migrations["${key}"] must be a non-empty note.`;
    }
  }

  const prefix = `${name}@`;
  const published = readdirSync(versionsDir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".json"))
    .map((file) => file.slice(prefix.length, -".json".length))
    .filter((candidate) => candidate !== version);
  if (published.length === 0) return null;

  const majorOf = (v: string) => Number(v.split(".")[0]);
  const highestMajor = Math.max(...published.map(majorOf));
  if (majorOf(version) > highestMajor && !(migrations as Record<string, string> | undefined)?.[version]) {
    return `${name}@${version} is a new major version with no meta.migrations["${version}"]. Say what a project has to change, then build again.`;
  }

  // notesBetween (packages/kit) reads migration notes from whichever version a project
  // updates *to*, not from every version in between — so each new build has to carry every
  // prior note forward itself, or an update landing past it silently loses that note.
  const priorVersions = published.filter((candidate) => bySemver(candidate, version) < 0);
  if (priorVersions.length > 0) {
    const previousVersion = priorVersions.reduce((latest, candidate) => (bySemver(candidate, latest) > 0 ? candidate : latest));
    const previous = JSON.parse(readFileSync(join(versionsDir, `${name}@${previousVersion}.json`), "utf8")) as Item;
    const previousMigrations = (previous.meta?.migrations as Record<string, string> | undefined) ?? {};
    const currentMigrations = (migrations as Record<string, string> | undefined) ?? {};
    const dropped = Object.keys(previousMigrations).filter((key) => !currentMigrations[key]);
    if (dropped.length > 0) {
      return `${name}@${version} drops migration note(s) for ${dropped.join(", ")}, carried by ${previousVersion}. Copy them into meta.migrations before publishing.`;
    }
  }
  return null;
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
    const problem = migrationProblem(name, version, built);
    if (problem) {
      console.error(`✗ ${problem}`);
      failed = true;
      continue;
    }
    writeFileSync(target, JSON.stringify(built, null, 2) + "\n");
    console.log(`+ v/${name}@${version}.json`);
  }
  index[name] = { version, hash, history: historyOf(name) };
}

writeFileSync(join(out, "versions.json"), JSON.stringify(index, null, 2) + "\n");
if (failed) process.exit(1);
console.log(`Versioned ${Object.keys(index).length} items.`);
