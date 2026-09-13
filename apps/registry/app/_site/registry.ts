import { readFile } from "node:fs/promises";
import path from "node:path";

import registryJson from "@/registry.json";
import versionsJson from "@/public/r/versions.json";

type Tier = "block" | "pattern" | "primitive" | "hook" | "lib";
type Track = "minor" | "patch" | "none";

type Item = {
  name: string;
  title: string;
  description: string;
  tier: Tier;
  track: Track;
  version: string;
  /** Registry items this one pulls in, as bare names. */
  dependsOn: string[];
  /** npm packages the item needs. */
  packages: string[];
  files: string[];
};

type Group = { tier: Tier; title: string; singular: string; blurb: string; items: Item[] };

type RawItem = (typeof registryJson.items)[number];

const versions = versionsJson as Record<string, { version: string; hash: string }>;

/**
 * Order is deliberate: composed things first, so someone scanning the sidebar meets a
 * working table before the button it is built from. `singular` is spelled out because
 * "Libraries" does not survive having its last letter trimmed.
 */
const TIERS: Omit<Group, "items">[] = [
  { tier: "block", title: "Blocks", singular: "Block", blurb: "Whole working sections. Install one, then swap the sample data for yours." },
  { tier: "pattern", title: "Patterns", singular: "Pattern", blurb: "Interactive pieces assembled from primitives." },
  { tier: "primitive", title: "Primitives", singular: "Primitive", blurb: "The base controls everything else is built from." },
  { tier: "hook", title: "Hooks", singular: "Hook", blurb: "State and behaviour, no markup." },
  { tier: "lib", title: "Libraries", singular: "Library", blurb: "Helpers the other items share." },
];

const TRACK_LABEL: Record<Track, string> = {
  minor: "Minor and patch",
  patch: "Patch only",
  none: "Pinned",
};

/**
 * Fails the build on an item the site can't place. Defaulting a missing tier would give the
 * item a page but file it under the wrong heading — or under none, for a tier this file
 * doesn't know — which is the silent version of the same mistake.
 */
function toItem(raw: RawItem): Item {
  const meta = ("meta" in raw ? raw.meta : undefined) as { tier?: string; track?: string } | undefined;
  if (!TIERS.some((tier) => tier.tier === meta?.tier)) {
    throw new Error(`registry.json: "${raw.name}" has meta.tier "${meta?.tier}", which the site has no group for.`);
  }
  if (!meta?.track || !(meta.track in TRACK_LABEL)) {
    throw new Error(`registry.json: "${raw.name}" has meta.track "${meta?.track}", which is not minor, patch or none.`);
  }
  return {
    name: raw.name,
    title: raw.title,
    description: raw.description,
    tier: meta.tier as Tier,
    track: meta.track as Track,
    version: versions[raw.name]?.version ?? "0.0.0",
    dependsOn: ("registryDependencies" in raw ? (raw.registryDependencies as string[]) : []).map((d) =>
      d.replace(/^@ja3dan\//, ""),
    ),
    packages: "dependencies" in raw ? (raw.dependencies as string[]) : [],
    files: raw.files.map((file) => file.path),
  };
}

/** The `setup` item configures a project rather than adding a component, so it is not an item. */
const items: Item[] = registryJson.items.filter((raw) => raw.name !== "setup").map(toItem);

const setup = registryJson.items.find((raw) => raw.name === "setup")!;

const groups: Group[] = TIERS.map((tier) => ({
  ...tier,
  items: items.filter((item) => item.tier === tier.tier),
}));

function getItem(name: string): Item | undefined {
  return items.find((item) => item.name === name);
}

function getGroup(tier: Tier): Group {
  return groups.find((group) => group.tier === tier)!;
}

/** What depends on this item — the other half of `dependsOn`, and not stored anywhere. */
function dependents(name: string): Item[] {
  return items.filter((item) => item.dependsOn.includes(name));
}

type SourceFile = { path: string; content: string };

/**
 * Source comes from the built item in `public/r/`, not from `registry/groundwork/**`.
 * That JSON is what a consumer actually receives; the working tree may hold a change
 * that has not been through `registry:build` yet, and showing it would be a lie.
 */
async function getSource(name: string): Promise<SourceFile[]> {
  const file = path.join(process.cwd(), "public", "r", `${name}.json`);
  const text = await readFile(file, "utf8").catch(() => {
    throw new Error(`public/r/${name}.json is missing. An item in registry.json hasn't been built: run bun run registry:build.`);
  });
  const built = JSON.parse(text) as {
    files?: { path: string; content?: string }[];
  };
  return (built.files ?? [])
    .filter((entry): entry is SourceFile => typeof entry.content === "string")
    .map((entry) => ({ path: entry.path, content: entry.content }));
}

/**
 * Where this deployment serves the registry from. The same `REGISTRY_URL` that
 * `scripts/version-registry.ts` writes into `setup.json`, so the command on the page and
 * the registry URL the setup item installs can never name two different hosts. On Vercel
 * without it set, the production domain is the next best answer; locally, the dev server.
 */
const REGISTRY_URL = (
  process.env.REGISTRY_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3100")
).replace(/\/$/, "");

const setupCommand = `bunx shadcn@latest init ${REGISTRY_URL}/r/setup.json`;

function installCommand(name: string): string {
  return `bunx shadcn@latest add @ja3dan/${name}`;
}

export {
  dependents,
  getGroup,
  getItem,
  getSource,
  groups,
  installCommand,
  items,
  REGISTRY_URL,
  setup,
  setupCommand,
  TRACK_LABEL,
  type Group,
  type Item,
  type SourceFile,
  type Tier,
  type Track,
};
