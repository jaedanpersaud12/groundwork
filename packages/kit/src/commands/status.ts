import { readFileSync } from "node:fs";
import path from "node:path";

import { LOCK_FILE, readLock } from "../lockfile";
import { locateFiles } from "../project";
import { bySemver, itemRef, loadRegistry, versionUrl, type Registry, type RegistryItem, type Track } from "../registry";
import { planAdd, viewFile, type PlannedFile } from "../shadcn";

type Bump = "none" | "patch" | "minor" | "major";

type ItemStatus = {
  name: string;
  installed: string;
  latest: string;
  track: Track;
  bump: Bump;
  /** Whether the item's track takes this bump: `minor` takes minor and patch, `patch` only patch, `none` nothing. */
  withinTrack: boolean;
  /** Project paths whose content differs from the locked version's. */
  edited: string[];
  /** Project paths the item ships that aren't there. */
  missing: string[];
  /**
   * The registry's hash for the locked version no longer matches the lock. Published versions
   * are immutable, so this means the merge base itself can't be trusted — reported, never
   * worked around.
   */
  baseChanged: boolean;
  /** For a major bump: whether the latest version publishes a migration note for it. */
  migrationNote: boolean;
};

type StatusResult = {
  items: ItemStatus[];
  /** In the lock, gone from the registry. */
  removed: string[];
  /** Installed, but not in the lock: `kit lock --force` would pick them up. */
  unlocked: string[];
};

function bumpBetween(from: string, to: string): Bump {
  if (bySemver(from, to) >= 0) return "none";
  const [a, b] = [from, to].map((version) => version.split(".").map(Number));
  if (b[0] !== a[0]) return "major";
  if (b[1] !== a[1]) return "minor";
  return "patch";
}

/** What each track accepts. Shared with `update`, which picks its default target by it. */
const TAKES: Record<Track, Bump[]> = {
  minor: ["minor", "patch"],
  patch: ["patch"],
  none: [],
};

/**
 * Edited means "differs from the version the lock says is installed", derived fresh each time
 * rather than trusted from a recorded hash — a project edited before `kit lock` ran would
 * otherwise read as pristine. A file already identical to the latest version, when that is
 * also the locked version, needs no second look.
 */
async function editedFiles(cwd: string, registry: Registry, item: RegistryItem, version: string, files: PlannedFile[]): Promise<string[]> {
  const latest = registry.versions[item.name].version;
  const edited: string[] = [];
  for (const file of files) {
    if (file.status === "create") continue;
    if (file.status === "skip" && version === latest) continue;
    const base = await viewFile(cwd, versionUrl(registry, item.name, version), file.path);
    if (base !== readFileSync(path.join(cwd, file.path), "utf8")) edited.push(file.path);
  }
  return edited;
}

/** Read-only: compares the lock against the registry and the files on disk, and changes nothing. */
async function status(cwd: string): Promise<StatusResult> {
  const lock = readLock(cwd);
  if (!lock) throw new Error(`No ${LOCK_FILE} in ${cwd}. Run \`kit lock\` first.`);

  const registry = await loadRegistry(cwd);
  const byName = new Map(registry.items.map((item) => [item.name, item]));
  const plan = await planAdd(cwd, registry.items.map((item) => itemRef(item.name)));
  const located = locateFiles(registry.items, plan);

  const items: ItemStatus[] = [];
  const removed: string[] = [];

  for (const [ref, entry] of Object.entries(lock.items)) {
    const name = ref.slice(ref.indexOf("/") + 1);
    const item = byName.get(name);
    if (!item) {
      removed.push(name);
      continue;
    }
    const versions = registry.versions[name];
    const files = located.get(name)!;
    const bump = bumpBetween(entry.version, versions.version);
    items.push({
      name,
      installed: entry.version,
      latest: versions.version,
      track: entry.track,
      bump,
      withinTrack: bump !== "none" && TAKES[entry.track].includes(bump),
      edited: await editedFiles(cwd, registry, item, entry.version, files),
      missing: files.filter((file) => file.status === "create").map((file) => file.path),
      baseChanged: versions.history[entry.version] !== entry.computedHash,
      migrationNote:
        bump === "major" &&
        Object.keys(item.meta?.migrations ?? {}).some((version) => bySemver(entry.version, version) < 0 && bySemver(version, versions.version) <= 0),
    });
  }

  const unlocked = registry.items
    .filter((item) => !lock.items[itemRef(item.name)])
    .filter((item) => located.get(item.name)!.some((file) => file.status !== "create"))
    .map((item) => item.name);

  return { items, removed, unlocked };
}

export { bumpBetween, status, TAKES, type Bump, type ItemStatus, type StatusResult };
