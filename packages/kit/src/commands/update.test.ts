import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { readLock } from "../lockfile";
import { commit, createProject, install, startRegistry, type FixtureItem, type Project, type Registry } from "../testing/fixture";
import { lock } from "./lock";
import { MajorUpdateNeedsReview, notesBetween, PENDING_MESSAGE, update } from "./update";

/**
 * Chip's body is ten numbered lines, so a test can change line 2 on one side and line 9 on
 * the other and know git's merge sees them as separate hunks.
 */
const lines = (overrides: Record<number, string> = {}) =>
  Array.from({ length: 10 }, (_, index) => overrides[index + 1] ?? `export const line${index + 1} = ${index + 1};`).join("\n");

const chip = (version: string, body = lines(), extra: FixtureItem["files"] = []): FixtureItem => ({
  name: "chip",
  version,
  track: "minor",
  files: [{ path: "registry/groundwork/ui/chip.tsx", content: `import { cn } from "@/lib/utils";\n\n${body}\n` }, ...extra],
});

let registry: Registry;
let project: Project;

const git = (...args: string[]) => Bun.spawnSync(["git", ...args], { cwd: project.dir }).stdout.toString().trim();
const chipOnDisk = () => readFileSync(path.join(project.dir, "ui", "chip.tsx"), "utf8");

async function installAndLock(item: FixtureItem) {
  registry.publish(item);
  await install(project, `@ja3dan/${item.name}`);
  await lock(project.dir);
  commit(project, `install ${item.name}`);
}

beforeEach(async () => {
  registry = await startRegistry();
  project = createProject(registry.url);
});

afterEach(async () => {
  project.remove();
  await registry.close();
});

describe("kit sync update — overwrite path", () => {
  // Spec criterion 3: an unedited file is replaced and the lock entry bumped.
  test("replaces an unedited file and bumps the lock entry", async () => {
    await installAndLock(chip("1.0.0"));
    registry.publish(chip("1.1.0", lines({ 9: "export const line9 = 'upstream';" })));
    const versions = await (await fetch(`${registry.url}/r/versions.json`)).json();

    const result = await update(project.dir, "chip");

    expect(result.files).toEqual([{ path: "ui/chip.tsx", result: "overwritten" }]);
    expect(chipOnDisk()).toContain("export const line9 = 'upstream';");
    expect(chipOnDisk()).toContain("@/shared/cn");
    expect(readLock(project.dir)!.items["@ja3dan/chip"]).toMatchObject({ version: "1.1.0", computedHash: versions.chip.history["1.1.0"] });
  });

  test("adds a file that's new in the target version", async () => {
    await installAndLock(chip("1.0.0"));
    registry.publish(chip("1.1.0", lines(), [{ path: "registry/groundwork/ui/chip-icon.tsx", content: "export const ChipIcon = null;\n" }]));

    const result = await update(project.dir, "chip");
    expect(result.files).toContainEqual({ path: "ui/chip-icon.tsx", result: "added" });
    expect(existsSync(path.join(project.dir, "ui", "chip-icon.tsx"))).toBe(true);
  });

  test("installs a registry item the new version newly depends on, and locks it", async () => {
    registry.publish({ name: "badge", version: "1.0.0", track: "patch", files: [{ path: "registry/groundwork/ui/badge.tsx", content: "export const Badge = 1;\n" }] });
    await installAndLock(chip("1.0.0"));
    registry.publish({ ...chip("1.1.0"), registryDependencies: ["@ja3dan/badge"] });

    const result = await update(project.dir, "chip");
    expect(result.installedItems).toEqual(["badge"]);
    expect(existsSync(path.join(project.dir, "ui", "badge.tsx"))).toBe(true);
    expect(readLock(project.dir)!.items["@ja3dan/badge"]).toMatchObject({ version: "1.0.0", track: "patch" });
  });
});

describe("kit sync update — merge path", () => {
  // Spec criterion 4, first half: a non-overlapping local edit survives.
  test("a non-overlapping local edit survives the update", async () => {
    await installAndLock(chip("1.0.0"));
    writeFileSync(path.join(project.dir, "ui", "chip.tsx"), chipOnDisk().replace("export const line2 = 2;", "export const line2 = 'mine';"));
    commit(project, "local edit");
    registry.publish(chip("1.1.0", lines({ 9: "export const line9 = 'upstream';" })));

    const result = await update(project.dir, "chip");

    expect(result.files).toEqual([{ path: "ui/chip.tsx", result: "merged" }]);
    expect(result.conflicted).toBe(false);
    expect(chipOnDisk()).toContain("export const line2 = 'mine';");
    expect(chipOnDisk()).toContain("export const line9 = 'upstream';");
    expect(chipOnDisk()).not.toContain("<<<<<<<");
  });

  // Spec criterion 4, second half: an overlapping edit leaves markers instead of picking a side.
  test("an overlapping local edit leaves conflict markers rather than silently picking a side", async () => {
    await installAndLock(chip("1.0.0"));
    writeFileSync(path.join(project.dir, "ui", "chip.tsx"), chipOnDisk().replace("export const line5 = 5;", "export const line5 = 'mine';"));
    commit(project, "local edit");
    registry.publish(chip("1.1.0", lines({ 5: "export const line5 = 'upstream';" })));

    const result = await update(project.dir, "chip");
    const merged = chipOnDisk();

    expect(result.files).toEqual([{ path: "ui/chip.tsx", result: "conflicted" }]);
    expect(result.conflicted).toBe(true);
    expect(result.committed).toBe(false);
    expect(merged).toContain("<<<<<<< project");
    expect(merged).toContain("export const line5 = 'mine';");
    expect(merged).toContain("export const line5 = 'upstream';");
    expect(merged).toContain(">>>>>>> registry");
  });
});

describe("kit sync update — the branch", () => {
  // Spec criterion 7: lands on a branch, described by item, version change and outcome.
  test("a clean update is committed on its own branch with a description naming the item, versions and outcome", async () => {
    await installAndLock(chip("1.0.0"));
    const before = git("rev-parse", "HEAD");
    writeFileSync(path.join(project.dir, "ui", "chip.tsx"), chipOnDisk().replace("export const line2 = 2;", "export const line2 = 'mine';"));
    commit(project, "local edit");
    registry.publish(chip("1.1.0", lines({ 9: "export const line9 = 'upstream';" })));

    const result = await update(project.dir, "chip");

    expect(git("branch", "--show-current")).toBe("kit/chip-1.1.0");
    expect(git("status", "--porcelain")).toBe("");
    expect(git("log", "-1", "--format=%B")).toBe(result.description.trim());
    expect(result.description).toContain("Update @ja3dan/chip 1.0.0 → 1.1.0");
    expect(result.description).toContain("Merged cleanly.");
    expect(result.description).toContain("ui/chip.tsx: merged — local edits kept");
    expect(git("rev-list", "--count", `${before}..HEAD`)).toBe("2");
  });

  test("a conflicted update stays uncommitted on its branch, with the description saved for the commit", async () => {
    await installAndLock(chip("1.0.0"));
    writeFileSync(path.join(project.dir, "ui", "chip.tsx"), chipOnDisk().replace("export const line5 = 5;", "export const line5 = 'mine';"));
    commit(project, "local edit");
    registry.publish(chip("1.1.0", lines({ 5: "export const line5 = 'upstream';" })));

    const result = await update(project.dir, "chip");

    expect(git("branch", "--show-current")).toBe("kit/chip-1.1.0");
    expect(git("status", "--porcelain")).toContain("ui/chip.tsx");
    expect(result.description).toContain("Conflicted: local edits overlap the update in ui/chip.tsx");
    expect(readFileSync(path.join(project.dir, PENDING_MESSAGE), "utf8")).toBe(result.description);
  });
});

describe("kit sync update — refusals", () => {
  test("refuses to start on uncommitted changes, and changes nothing", async () => {
    await installAndLock(chip("1.0.0"));
    registry.publish(chip("1.1.0"));
    appendFileSync(path.join(project.dir, "ui", "chip.tsx"), "// not committed\n");

    await expect(update(project.dir, "chip")).rejects.toThrow("Commit or stash your changes first");
    expect(git("branch", "--show-current")).not.toStartWith("kit/");
  });

  test("says so when the item is already current", async () => {
    await installAndLock(chip("1.0.0"));
    await expect(update(project.dir, "chip")).rejects.toThrow("already at 1.0.0");
  });

  test("won't take an update outside the item's track without --to", async () => {
    registry.publish({ ...chip("1.0.0"), track: "patch" });
    await install(project, "@ja3dan/chip");
    await lock(project.dir);
    commit(project, "install");
    registry.publish({ ...chip("1.1.0"), track: "patch" });

    await expect(update(project.dir, "chip")).rejects.toThrow("outside its patch track. Pass --to 1.1.0");
    const result = await update(project.dir, "chip", { to: "1.1.0" });
    expect(result.to).toBe("1.1.0");
  });

  test("refuses when the locked version's published content no longer matches the lock", async () => {
    await installAndLock(chip("1.0.0"));
    const lockPath = path.join(project.dir, "kit.lock.json");
    const written = JSON.parse(readFileSync(lockPath, "utf8"));
    written.items["@ja3dan/chip"].computedHash = "0".repeat(64);
    writeFileSync(lockPath, JSON.stringify(written));
    commit(project, "tampered lock");
    registry.publish(chip("1.1.0"));

    await expect(update(project.dir, "chip")).rejects.toThrow("can't be trusted as a merge base");
  });

  test("an item that isn't locked", async () => {
    registry.publish(chip("1.0.0"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);
    commit(project, "install");
    await expect(update(project.dir, "badge")).rejects.toThrow("isn't in kit.lock.json");
  });
});

describe("kit sync update — major versions", () => {
  const NOTE = "Chip's line5 export is renamed to five; update imports before building.";

  // Spec criterion 5: a major surfaces its migration note instead of merging silently.
  test("a major update stops at its migration note and changes nothing", async () => {
    await installAndLock(chip("1.0.0"));
    const head = git("rev-parse", "HEAD");
    const before = chipOnDisk();
    registry.publish({ ...chip("2.0.0", lines({ 5: "export const five = 5;" })), migrations: { "2.0.0": NOTE } });

    const attempt = update(project.dir, "chip", { to: "2.0.0" });
    await expect(attempt).rejects.toBeInstanceOf(MajorUpdateNeedsReview);
    const error = (await attempt.catch((caught) => caught)) as MajorUpdateNeedsReview;

    expect(error.notes).toEqual([{ version: "2.0.0", note: NOTE }]);
    expect(error.message).toContain("re-run with --accept-major");
    expect(git("rev-parse", "HEAD")).toBe(head);
    expect(git("branch", "--show-current")).not.toStartWith("kit/");
    expect(git("status", "--porcelain")).toBe("");
    expect(chipOnDisk()).toBe(before);
  });

  test("with --accept-major it merges, and the notes go into the description", async () => {
    await installAndLock(chip("1.0.0"));
    registry.publish({ ...chip("2.0.0", lines({ 5: "export const five = 5;" })), migrations: { "2.0.0": NOTE } });

    const result = await update(project.dir, "chip", { to: "2.0.0", acceptMajor: true });

    expect(result.files).toEqual([{ path: "ui/chip.tsx", result: "overwritten" }]);
    expect(result.migrations).toEqual([{ version: "2.0.0", note: NOTE }]);
    expect(result.description).toContain("Migration notes — this is a major update:");
    expect(result.description).toContain(`- 2.0.0: ${NOTE}`);
    expect(git("log", "-1", "--format=%B")).toContain(NOTE);
    expect(readLock(project.dir)!.items["@ja3dan/chip"].version).toBe("2.0.0");
  });

  test("a major with no published note still stops, and says there's no note", async () => {
    await installAndLock(chip("1.0.0"));
    registry.publish(chip("2.0.0"));
    await expect(update(project.dir, "chip", { to: "2.0.0" })).rejects.toThrow("published no migration note");
  });

  test("notesBetween takes every note after the installed version up to the target", () => {
    const item = { name: "chip", type: "registry:ui", files: [], meta: { migrations: { "2.0.0": "two", "3.0.0": "three", "4.0.0": "four" } } };
    expect(notesBetween(item, "1.4.0", "3.0.0")).toEqual([
      { version: "2.0.0", note: "two" },
      { version: "3.0.0", note: "three" },
    ]);
    expect(notesBetween(item, "2.0.0", "2.1.0")).toEqual([]);
  });
});
