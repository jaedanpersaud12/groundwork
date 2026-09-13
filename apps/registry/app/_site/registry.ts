import { readFile } from "node:fs/promises";
import path from "node:path";

import registryJson from "@/registry.json";
import versionsJson from "@/public/r/versions.json";

export type Tier = "block" | "pattern" | "primitive" | "hook" | "lib";
export type Track = "major" | "minor" | "patch" | "none";

export type Item = {
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

export type Group = { tier: Tier; title: string; blurb: string; items: Item[] };

type RawItem = (typeof registryJson.items)[number];

const versions = versionsJson as Record<string, { version: string; hash: string }>;

/**
 * Order is deliberate: composed things first, so someone scanning the sidebar meets a
 * working table before the button it is built from.
 */
const TIERS: { tier: Tier; title: string; blurb: string }[] = [
  { tier: "block", title: "Blocks", blurb: "Whole working sections. Install one, then swap the sample data for yours." },
  { tier: "pattern", title: "Patterns", blurb: "Interactive pieces assembled from primitives." },
  { tier: "primitive", title: "Primitives", blurb: "The base controls everything else is built from." },
  { tier: "hook", title: "Hooks", blurb: "State and behaviour, no markup." },
  { tier: "lib", title: "Libraries", blurb: "Helpers the other items share." },
];

export const TRACK_LABEL: Record<Track, string> = {
  major: "Every release",
  minor: "Minor and patch",
  patch: "Patch only",
  none: "Pinned",
};

function toItem(raw: RawItem): Item {
  const meta = "meta" in raw ? (raw.meta as { tier: Tier; track: Track }) : undefined;
  return {
    name: raw.name,
    title: raw.title,
    description: raw.description,
    tier: meta?.tier ?? "lib",
    track: meta?.track ?? "none",
    version: versions[raw.name]?.version ?? "0.0.0",
    dependsOn: ("registryDependencies" in raw ? (raw.registryDependencies as string[]) : []).map((d) =>
      d.replace(/^@ja3dan\//, ""),
    ),
    packages: "dependencies" in raw ? (raw.dependencies as string[]) : [],
    files: raw.files.map((file) => file.path),
  };
}

/** The `setup` item configures a project rather than adding a component, so it is not an item. */
export const items: Item[] = registryJson.items.filter((raw) => raw.name !== "setup").map(toItem);

export const setup = registryJson.items.find((raw) => raw.name === "setup")!;

export const groups: Group[] = TIERS.map((tier) => ({
  ...tier,
  items: items.filter((item) => item.tier === tier.tier),
}));

export function getItem(name: string): Item | undefined {
  return items.find((item) => item.name === name);
}

/** What depends on this item — the other half of `dependsOn`, and not stored anywhere. */
export function dependents(name: string): Item[] {
  return items.filter((item) => item.dependsOn.includes(name));
}

export type SourceFile = { path: string; content: string };

/**
 * Source comes from the built item in `public/r/`, not from `registry/groundwork/**`.
 * That JSON is what a consumer actually receives; the working tree may hold a change
 * that has not been through `registry:build` yet, and showing it would be a lie.
 */
export async function getSource(name: string): Promise<SourceFile[]> {
  const file = path.join(process.cwd(), "public", "r", `${name}.json`);
  const built = JSON.parse(await readFile(file, "utf8")) as {
    files?: { path: string; content?: string }[];
  };
  return (built.files ?? [])
    .filter((entry): entry is SourceFile => typeof entry.content === "string")
    .map((entry) => ({ path: entry.path, content: entry.content }));
}

export function installCommand(name: string): string {
  return `bunx shadcn@latest add @ja3dan/${name}`;
}
