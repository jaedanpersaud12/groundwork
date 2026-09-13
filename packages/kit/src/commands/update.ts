import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { branchExists, commitAll, createBranch, dirtyPaths, isRepo, mergeFile } from "../git";
import { LOCK_FILE, readLock, writeLock } from "../lockfile";
import { locateFiles } from "../project";
import { bySemver, itemRef, loadRegistry, NAMESPACE, versionUrl, type Registry, type RegistryItem } from "../registry";
import { installItems, planAdd, viewFile } from "../shadcn";
import { bumpBetween, TAKES } from "./status";

type FileOutcome = {
  path: string;
  /**
   * `overwritten`: the copy was untouched, so the new version replaced it. `merged`: the copy
   * had local edits and they merged cleanly. `conflicted`: they overlap; the file holds
   * conflict markers. `added`: new in this version. `unchanged`: identical in both versions.
   */
  result: "overwritten" | "merged" | "conflicted" | "added" | "unchanged";
};

type UpdateResult = {
  name: string;
  from: string;
  to: string;
  branch: string;
  files: FileOutcome[];
  /** Files the locked version shipped and the new one doesn't. Left in place, never deleted. */
  dropped: string[];
  /** Registry items the new version depends on that weren't installed; kit installed them. */
  installedItems: string[];
  /**
   * npm packages the new version needs that `package.json` doesn't list. Named, not installed:
   * which package manager and which dependency field is the project's call.
   */
  missingPackages: string[];
  conflicted: boolean;
  /** True when kit committed the update; false when conflicts are left for a person to resolve. */
  committed: boolean;
  description: string;
};

/** Where the description waits when conflicts stop kit from committing. */
const PENDING_MESSAGE = path.join(".git", "KIT_UPDATE_MSG");

/** The newest published version the item's track takes, or null when there isn't one. */
function targetWithinTrack(registry: Registry, name: string, from: string, track: keyof typeof TAKES): string | null {
  const newer = Object.keys(registry.versions[name].history)
    .sort(bySemver)
    .filter((version) => TAKES[track].includes(bumpBetween(from, version)));
  return newer.at(-1) ?? null;
}

async function fetchVersion(registry: Registry, name: string, version: string): Promise<RegistryItem> {
  const response = await fetch(versionUrl(registry, name, version));
  if (!response.ok) throw new Error(`${versionUrl(registry, name, version)} returned ${response.status}.`);
  return (await response.json()) as RegistryItem;
}

const RESULT_LABEL: Record<FileOutcome["result"], string> = {
  overwritten: "replaced (no local edits)",
  merged: "merged — local edits kept",
  conflicted: "CONFLICT — local edits overlap the update",
  added: "added (new in this version)",
  unchanged: "unchanged",
};

/**
 * The commit message, and the body of the PR it becomes. A reviewer should learn from it what
 * changed and whether a person still has to look, without opening the diff first.
 */
function describe(result: Omit<UpdateResult, "description" | "committed">): string {
  const conflictedFiles = result.files.filter((file) => file.result === "conflicted").map((file) => file.path);
  const lines = [
    `Update ${itemRef(result.name)} ${result.from} → ${result.to}`,
    "",
    result.conflicted
      ? `Conflicted: local edits overlap the update in ${conflictedFiles.join(", ")}. Resolve the markers (project / base / registry), then commit.`
      : "Merged cleanly.",
    "",
    ...result.files.map((file) => `- ${file.path}: ${RESULT_LABEL[file.result]}`),
    ...result.dropped.map((file) => `- ${file}: no longer shipped by ${result.to}; left in place`),
    ...result.installedItems.map((item) => `- ${itemRef(item)}: installed, new dependency of ${result.to}`),
    ...(result.missingPackages.length
      ? ["", `Needs npm packages this project doesn't list yet: ${result.missingPackages.join(", ")}. Install them before building.`]
      : []),
    "",
    "Via `kit sync update`.",
  ];
  return `${lines.join("\n")}\n`;
}

/**
 * Updates one installed item on a new branch. Unedited files are overwritten; edited ones are
 * 3-way merged against the locked version, so local changes survive or show up as conflicts —
 * never silently lost, never silently picked. Every side of the merge comes from shadcn, in
 * project dialect.
 */
async function update(cwd: string, name: string, { to }: { to?: string } = {}): Promise<UpdateResult> {
  const lock = readLock(cwd);
  if (!lock) throw new Error(`No ${LOCK_FILE} in ${cwd}. Run \`kit lock\` first.`);
  const entry = lock.items[itemRef(name)];
  if (!entry) throw new Error(`${itemRef(name)} isn't in ${LOCK_FILE}. Installed items it doesn't list can be added with \`kit lock --force\`.`);

  if (!(await isRepo(cwd))) throw new Error(`${cwd} isn't a git repository; kit updates on a branch so the change can be reviewed.`);
  const dirty = await dirtyPaths(cwd);
  if (dirty.length) {
    throw new Error(`Commit or stash your changes first — an update on top of uncommitted work can't be reviewed on its own. Uncommitted: ${dirty.slice(0, 5).join(", ")}${dirty.length > 5 ? ", …" : ""}`);
  }

  const registry = await loadRegistry(cwd);
  const versions = registry.versions[name];
  if (!versions) throw new Error(`${itemRef(name)} is no longer in the registry at ${registry.base}.`);
  if (versions.history[entry.version] !== entry.computedHash) {
    throw new Error(`The registry's published ${name}@${entry.version} no longer matches ${LOCK_FILE}'s hash, so it can't be trusted as a merge base. Nothing was changed.`);
  }

  const target = to ?? targetWithinTrack(registry, name, entry.version, entry.track);
  if (!target) {
    const latest = versions.version;
    throw new Error(
      bySemver(entry.version, latest) >= 0
        ? `${itemRef(name)} is already at ${entry.version}, the latest version.`
        : `${itemRef(name)} ${entry.version} → ${latest} is a ${bumpBetween(entry.version, latest)} update, outside its ${entry.track} track. Pass --to ${latest} to take it anyway.`,
    );
  }
  if (!versions.history[target]) throw new Error(`${name}@${target} was never published.`);
  if (bySemver(entry.version, target) >= 0) throw new Error(`${itemRef(name)} is at ${entry.version}; ${target} isn't newer.`);
  if (bumpBetween(entry.version, target) === "major") {
    throw new Error(`${itemRef(name)} ${entry.version} → ${target} is a major update. Major updates surface their migration note first, which isn't built yet.`);
  }

  const branch = `kit/${name}-${target}`;
  if (await branchExists(cwd, branch)) throw new Error(`Branch ${branch} already exists. Delete it, or finish the update that's on it.`);

  const [fromItem, toItem] = await Promise.all([fetchVersion(registry, name, entry.version), fetchVersion(registry, name, target)]);
  const fromUrl = versionUrl(registry, name, entry.version);
  const toUrl = versionUrl(registry, name, target);

  // Project paths for both versions' files. Each item is planned from its own versioned URL,
  // because a parent's plan only ever shows dependencies at their current version.
  const [fromPlan, toPlan] = await Promise.all([planAdd(cwd, fromUrl), planAdd(cwd, toUrl)]);
  const fromFiles = locateFiles([fromItem], fromPlan).get(name)!;
  const toFiles = locateFiles([toItem], toPlan).get(name)!;

  await createBranch(cwd, branch);

  const files: FileOutcome[] = [];
  for (const file of toFiles) {
    const destination = path.join(cwd, file.path);
    const incoming = await viewFile(cwd, toUrl, file.path);

    if (!existsSync(destination)) {
      mkdirSync(path.dirname(destination), { recursive: true });
      writeFileSync(destination, incoming);
      files.push({ path: file.path, result: "added" });
      continue;
    }

    const onDisk = readFileSync(destination, "utf8");
    const shippedBefore = fromFiles.some((candidate) => candidate.path === file.path);
    const base = shippedBefore ? await viewFile(cwd, fromUrl, file.path) : "";

    if (onDisk === incoming) {
      files.push({ path: file.path, result: "unchanged" });
    } else if (shippedBefore && onDisk === base) {
      writeFileSync(destination, incoming);
      files.push({ path: file.path, result: "overwritten" });
    } else {
      const merged = await mergeFile(onDisk, base, incoming);
      writeFileSync(destination, merged.content);
      files.push({ path: file.path, result: merged.conflicts ? "conflicted" : "merged" });
    }
  }

  const dropped = fromFiles.map((file) => file.path).filter((file) => !toFiles.some((candidate) => candidate.path === file));

  // A registry dependency is missing when none of its files are in the project. Installing it
  // only creates files, so it can't disturb anything the merge just wrote.
  const newDependencies = (toItem.registryDependencies ?? [])
    .filter((ref) => ref.startsWith(`${NAMESPACE}/`))
    .map((ref) => ref.slice(NAMESPACE.length + 1));
  const installedItems: string[] = [];
  for (const dependency of newDependencies) {
    const dependencyItem = registry.items.find((item) => item.name === dependency);
    if (!dependencyItem) continue;
    const present = dependencyItem.files.some((file) =>
      toPlan.some((planned) => path.basename(planned.path) === path.basename(file.path) && planned.status !== "create"),
    );
    if (!present) installedItems.push(dependency);
  }
  if (installedItems.length) await installItems(cwd, installedItems.map(itemRef));

  const packageJson = JSON.parse(readFileSync(path.join(cwd, "package.json"), "utf8")) as Record<string, Record<string, string> | undefined>;
  const listed = new Set([...Object.keys(packageJson.dependencies ?? {}), ...Object.keys(packageJson.devDependencies ?? {})]);
  const missingPackages = ((toItem.dependencies as string[] | undefined) ?? [])
    .map((spec) => spec.replace(/(?<=.)@.*$/, ""))
    .filter((pkg) => !listed.has(pkg));

  lock.items[itemRef(name)] = {
    ...entry,
    source: NAMESPACE,
    version: target,
    computedHash: versions.history[target],
  };
  for (const dependency of installedItems) {
    const dependencyVersions = registry.versions[dependency];
    const dependencyItem = registry.items.find((item) => item.name === dependency)!;
    lock.items[itemRef(dependency)] = {
      source: NAMESPACE,
      sourceType: "registry",
      version: dependencyVersions.version,
      track: dependencyItem.meta?.track ?? "minor",
      computedHash: dependencyVersions.hash,
    };
  }
  writeLock(cwd, lock);

  const conflicted = files.some((file) => file.result === "conflicted");
  const summary = { name, from: entry.version, to: target, branch, files, dropped, installedItems, missingPackages, conflicted };
  const description = describe(summary);

  if (conflicted) {
    writeFileSync(path.join(cwd, PENDING_MESSAGE), description);
  } else {
    await commitAll(cwd, description);
  }
  return { ...summary, committed: !conflicted, description };
}

export { PENDING_MESSAGE, targetWithinTrack, update, type FileOutcome, type UpdateResult };
