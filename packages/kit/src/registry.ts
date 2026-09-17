import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

/** The namespace kit manages. Other registries in `components.json` are left alone. */
const NAMESPACE = "@ja3dan";

type RegistryFile = { path: string; type: string; target?: string; content?: string };

type RegistryItem = {
  name: string;
  type: string;
  title?: string;
  files: RegistryFile[];
  registryDependencies?: string[];
  meta?: { version?: string; track?: Track; migrations?: Record<string, string>; [key: string]: unknown };
  [key: string]: unknown;
};

type Track = "minor" | "patch" | "none";

type VersionIndex = Record<string, { version: string; hash: string; history: Record<string, string> }>;

type Registry = {
  /** The template exactly as `components.json` has it, e.g. `https://gw.jaedan.me/r/{name}.json`. */
  template: string;
  /** The registry root the template hangs off, e.g. `https://gw.jaedan.me`. */
  base: string;
  items: RegistryItem[];
  versions: VersionIndex;
};

/**
 * The same hash `apps/registry/scripts/version-registry.ts` records in `versions.json`: the
 * item JSON without `config` (which carries the deploying host) and without `meta.version`
 * (so a bump alone doesn't count as a content change). Kept byte-compatible — `registry.test.ts`
 * checks it against every file in the real `public/r/v/`.
 */
function hashItem(item: RegistryItem): string {
  return createHash("sha256")
    .update(JSON.stringify({ ...item, config: undefined, meta: { ...item.meta, version: undefined } }))
    .digest("hex");
}

/** `https://host/r/{name}.json` → `https://host`. Anything else isn't a registry kit can version. */
function baseOf(template: string): string {
  const match = /^(.*)\/r\/\{name\}\.json$/.exec(template);
  if (!match) {
    throw new Error(`The ${NAMESPACE} registry URL is "${template}"; kit expects one ending in /r/{name}.json.`);
  }
  return match[1];
}

function readTemplate(cwd: string): string {
  const file = path.join(cwd, "components.json");
  let config: { registries?: Record<string, string | { url?: string }> };
  try {
    config = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new Error(`No readable components.json in ${cwd}. Run kit from a project set up with shadcn.`);
  }
  const entry = config.registries?.[NAMESPACE];
  const template = typeof entry === "string" ? entry : entry?.url;
  if (!template) {
    throw new Error(`components.json has no "${NAMESPACE}" registry. Was the project initialised from the groundwork setup item?`);
  }
  return template;
}

/** Backoff between attempts, in ms. Short enough that a real outage still fails inside ~2s. */
const RETRY_DELAYS = [250, 750, 1500];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Registry fetches retry network errors and 5xx responses. A first-run `ConnectionRefused` that
 * succeeds on an identical second run is common enough (cold DNS, a sandbox proxy warming up) that
 * failing on it sends people debugging `.npmrc` for nothing. A 4xx is a real answer and isn't retried.
 */
async function getJson<T>(url: string, delays: number[] = RETRY_DELAYS): Promise<T> {
  let lastProblem = "";
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    if (attempt > 0) await sleep(delays[attempt - 1]);
    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      lastProblem = (error as Error).message;
      continue;
    }
    if (response.status >= 500) {
      lastProblem = `returned ${response.status}`;
      continue;
    }
    if (!response.ok) throw new Error(`${url} returned ${response.status}.`);
    return (await response.json()) as T;
  }
  throw new Error(
    `Couldn't reach ${url} after ${delays.length + 1} attempts (${lastProblem}). This is usually transient — run the command again.`,
  );
}

/**
 * The registry a project points at: its index and its version history. `setup` is a
 * `registry:base` that configures a project rather than installing files, so it is never
 * something to lock or sync.
 */
async function loadRegistry(cwd: string): Promise<Registry> {
  const template = readTemplate(cwd);
  const base = baseOf(template);
  const [index, versions] = await Promise.all([
    getJson<{ items: RegistryItem[] }>(`${base}/r/registry.json`),
    getJson<VersionIndex>(`${base}/r/versions.json`),
  ]);
  const missingHistory = Object.keys(versions).filter((name) => !versions[name].history);
  if (missingHistory.length) {
    throw new Error(`${base}/r/versions.json has no version history. The registry needs rebuilding with a current version-registry.ts.`);
  }
  return {
    template,
    base,
    items: index.items.filter((item) => item.type !== "registry:base"),
    versions,
  };
}

/** Numeric semver order, newest last. */
function bySemver(a: string, b: string): number {
  const [x, y] = [a, b].map((version) => version.split(".").map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
}

const itemRef = (name: string) => `${NAMESPACE}/${name}`;
const versionUrl = (registry: Registry, name: string, version: string) => `${registry.base}/r/v/${name}@${version}.json`;

export {
  baseOf,
  bySemver,
  getJson,
  hashItem,
  itemRef,
  loadRegistry,
  NAMESPACE,
  readTemplate,
  versionUrl,
  type Registry,
  type RegistryFile,
  type RegistryItem,
  type Track,
  type VersionIndex,
};
