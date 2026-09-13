import { readFileSync } from "node:fs";
import path from "node:path";

import { LOCK_FILE, readLock, writeLock, type Lock } from "../lockfile";
import { bySemver, itemRef, loadRegistry, NAMESPACE, versionUrl, type Registry, type RegistryItem } from "../registry";
import { planAdd, viewFile, type PlannedFile } from "../shadcn";

type LockedItem = {
  name: string;
  version: string;
  /**
   * `current`: every file matches the registry's current version. `past`: every file matches
   * an older published version exactly. `edited`: no version matches, so the lock takes the
   * closest one — whatever it records, sync will treat the local changes as edits to keep.
   */
  match: "current" | "past" | "edited";
  /** Files the item ships that aren't in the project. */
  missing: string[];
};

type LockResult = { lock: Lock; items: LockedItem[] };

/**
 * Lines in one text and not the other, counted as multisets. Crude next to a real diff, but
 * this only ranks candidate versions against each other to pick the closest.
 */
function distance(a: string, b: string): number {
  const counts = new Map<string, number>();
  for (const line of a.split("\n")) counts.set(line, (counts.get(line) ?? 0) + 1);
  for (const line of b.split("\n")) counts.set(line, (counts.get(line) ?? 0) - 1);
  let total = 0;
  for (const count of counts.values()) total += Math.abs(count);
  return total;
}

/**
 * Each item's own files, located in one dry run of every item at once. The dry run lists
 * dependencies' files too and doesn't say which item a file belongs to, so files are matched
 * by basename — safe because the registry's basenames are unique, and checked here so the
 * day they aren't, lock fails instead of guessing.
 */
function locateFiles(items: RegistryItem[], plan: PlannedFile[]): Map<string, PlannedFile[]> {
  const byBasename = new Map<string, PlannedFile>();
  for (const file of plan) byBasename.set(path.basename(file.path), file);

  const seen = new Map<string, string>();
  const located = new Map<string, PlannedFile[]>();
  for (const item of items) {
    located.set(
      item.name,
      item.files.map((file) => {
        const basename = path.basename(file.path);
        const owner = seen.get(basename);
        if (owner && owner !== item.name) {
          throw new Error(`${owner} and ${item.name} both ship a file named ${basename}; kit can't tell their copies apart.`);
        }
        seen.set(basename, item.name);
        const planned = byBasename.get(basename);
        if (!planned) throw new Error(`shadcn's plan didn't include ${file.path} from ${item.name}.`);
        return planned;
      }),
    );
  }
  return located;
}

async function identify(cwd: string, registry: Registry, item: RegistryItem, files: PlannedFile[]): Promise<LockedItem> {
  const installed = files.filter((file) => file.status !== "create");
  const missing = files.filter((file) => file.status === "create").map((file) => file.path);
  const current = registry.versions[item.name];

  if (installed.every((file) => file.status === "skip")) {
    return { name: item.name, version: current.version, match: "current", missing };
  }

  const onDisk = new Map(installed.map((file) => [file.path, readFileSync(path.join(cwd, file.path), "utf8")]));
  const candidates = Object.keys(current.history).sort(bySemver).reverse();
  let closest = { version: current.version, distance: Number.POSITIVE_INFINITY };

  for (const version of candidates) {
    let total = 0;
    for (const file of installed) {
      const published = await viewFile(cwd, versionUrl(registry, item.name, version), file.path);
      total += distance(published, onDisk.get(file.path)!);
    }
    if (total === 0) {
      return { name: item.name, version, match: version === current.version ? "current" : "past", missing };
    }
    if (total < closest.distance) closest = { version, distance: total };
  }
  return { name: item.name, version: closest.version, match: "edited", missing };
}

/**
 * Writes `kit.lock.json` for the registry items already installed in a project. Refuses to
 * replace an existing lock unless `force` — the lock is the record of what a project agreed
 * to, and silently rewriting it would lose that.
 */
async function lock(cwd: string, { force = false }: { force?: boolean } = {}): Promise<LockResult> {
  if (readLock(cwd) && !force) {
    throw new Error(`${LOCK_FILE} already exists. Use \`kit sync status\` to compare against it, or \`kit lock --force\` to rebuild it.`);
  }

  const registry = await loadRegistry(cwd);
  const plan = await planAdd(cwd, registry.items.map((item) => itemRef(item.name)));
  const located = locateFiles(registry.items, plan);

  const items: LockedItem[] = [];
  for (const item of registry.items) {
    const files = located.get(item.name)!;
    if (files.every((file) => file.status === "create")) continue;
    items.push(await identify(cwd, registry, item, files));
  }

  const result: Lock = {
    version: 1,
    registries: { [NAMESPACE]: registry.template },
    items: Object.fromEntries(
      items.map((locked) => {
        const item = registry.items.find((candidate) => candidate.name === locked.name)!;
        return [
          itemRef(locked.name),
          {
            source: NAMESPACE,
            sourceType: "registry" as const,
            version: locked.version,
            track: item.meta?.track ?? "minor",
            computedHash: registry.versions[locked.name].history[locked.version],
          },
        ];
      }),
    ),
  };
  writeLock(cwd, result);
  return { lock: result, items };
}

export { distance, lock, type LockedItem, type LockResult };
