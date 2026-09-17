import { existsSync } from "node:fs";
import path from "node:path";

import { readLock } from "../lockfile";
import { getJson, itemRef, loadRegistry, type RegistryItem, type VersionIndex } from "../registry";

type ListedItem = {
  name: string;
  tier: string;
  version: string;
  description: string;
  /** The locked version, or null when the project hasn't installed it. */
  installed: string | null;
};

/**
 * Everything the registry can install. "Registry first" is only actionable if you can see what the
 * registry has without fetching registry.json by hand. Works outside a project too (a blank
 * directory, before `kit init`), against the default registry or `--url`.
 */
async function list(cwd: string, { url }: { url: string }): Promise<ListedItem[]> {
  const inProject = existsSync(path.join(cwd, "components.json"));
  let items: RegistryItem[];
  let versions: VersionIndex;
  if (inProject && !url) {
    ({ items, versions } = await loadRegistry(cwd));
  } else {
    const base = (url || "https://gw.jaedan.me").replace(/\/$/, "");
    const [index, index2] = await Promise.all([
      getJson<{ items: RegistryItem[] }>(`${base}/r/registry.json`),
      getJson<VersionIndex>(`${base}/r/versions.json`),
    ]);
    items = index.items.filter((item) => item.type !== "registry:base");
    versions = index2;
  }
  const lock = inProject ? readLock(cwd) : null;
  return items
    .map((item) => ({
      name: item.name,
      tier: String(item.meta?.tier ?? item.type.replace("registry:", "")),
      version: versions[item.name]?.version ?? String(item.meta?.version ?? "?"),
      description: typeof item.description === "string" ? item.description : "",
      installed: lock?.items[itemRef(item.name)]?.version ?? null,
    }))
    .sort((a, b) => a.tier.localeCompare(b.tier) || a.name.localeCompare(b.name));
}

export { list, type ListedItem };
