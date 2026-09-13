import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { commit, createProject, install, startRegistry, type FixtureItem, type Project, type Registry } from "../testing/fixture";
import { lock } from "./lock";
import { bumpBetween, status } from "./status";

const chip = (version: string, body = `export const Chip = "${version}";`, track: FixtureItem["track"] = "minor"): FixtureItem => ({
  name: "chip",
  version,
  track,
  files: [{ path: "registry/groundwork/ui/chip.tsx", content: `import { cn } from "@/lib/utils";\n\n${body}\n` }],
});

const badge = (version: string): FixtureItem => ({
  name: "badge",
  version,
  track: "patch",
  files: [{ path: "registry/groundwork/ui/badge.tsx", content: `export const Badge = "${version}";\n` }],
});

let registry: Registry;
let project: Project;

beforeEach(async () => {
  registry = await startRegistry();
  project = createProject(registry.url);
});

afterEach(async () => {
  project.remove();
  await registry.close();
});

const find = async (name: string) => (await status(project.dir)).items.find((item) => item.name === name)!;

describe("kit sync status", () => {
  test("a freshly locked project is up to date with nothing edited", async () => {
    registry.publish(chip("1.0.0"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);

    expect(await status(project.dir)).toEqual({
      items: [
        { name: "chip", installed: "1.0.0", latest: "1.0.0", track: "minor", bump: "none", withinTrack: false, edited: [], missing: [], baseChanged: false },
      ],
      removed: [],
      unlocked: [],
    });
  });

  // Spec criterion 2, first half: bump the version, rebuild the registry, status says outdated.
  test("reports an item as outdated after its version is bumped and the registry rebuilt", async () => {
    registry.publish(chip("1.0.0"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);
    registry.publish(chip("1.1.0"));

    const chipStatus = await find("chip");
    expect(chipStatus).toMatchObject({ installed: "1.0.0", latest: "1.1.0", bump: "minor", withinTrack: true, edited: [] });
  });

  // Spec criterion 2, second half: a hand edit shows as edited, independently of being outdated.
  test("marks a locally edited file as edited, whether or not the item is outdated", async () => {
    registry.publish(chip("1.0.0"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);
    appendFileSync(path.join(project.dir, "ui", "chip.tsx"), "// local tweak\n");

    expect(await find("chip")).toMatchObject({ bump: "none", edited: ["ui/chip.tsx"] });

    registry.publish(chip("1.1.0"));
    expect(await find("chip")).toMatchObject({ bump: "minor", edited: ["ui/chip.tsx"] });
  });

  test("an unedited file that is simply behind is not reported as edited", async () => {
    registry.publish(chip("1.0.0"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);
    registry.publish(chip("2.0.0", "export const Chip = 2;\nexport const More = true;"));

    expect(await find("chip")).toMatchObject({ bump: "major", withinTrack: false, edited: [] });
  });

  test("the track decides what counts as available", async () => {
    registry.publish(badge("1.0.0"));
    await install(project, "@ja3dan/badge");
    await lock(project.dir);

    registry.publish(badge("1.0.1"));
    expect(await find("badge")).toMatchObject({ track: "patch", bump: "patch", withinTrack: true });

    registry.publish(badge("1.1.0"));
    expect(await find("badge")).toMatchObject({ track: "patch", bump: "minor", withinTrack: false });
  });

  test("reports missing files, items installed but not locked, and locked items the registry dropped", async () => {
    registry.publish(chip("1.0.0"));
    registry.publish(badge("1.0.0"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);
    await install(project, "@ja3dan/badge");

    const lockPath = path.join(project.dir, "kit.lock.json");
    const written = JSON.parse(readFileSync(lockPath, "utf8"));
    written.items["@ja3dan/gone"] = { ...written.items["@ja3dan/chip"], version: "1.0.0" };
    writeFileSync(lockPath, JSON.stringify(written));
    await Bun.file(path.join(project.dir, "ui", "chip.tsx")).delete();

    const result = await status(project.dir);
    expect(result.items.find((item) => item.name === "chip")!.missing).toEqual(["ui/chip.tsx"]);
    expect(result.unlocked).toEqual(["badge"]);
    expect(result.removed).toEqual(["gone"]);
  });

  test("flags a locked version whose published content changed underneath the lock", async () => {
    registry.publish(chip("1.0.0"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);
    commit(project, "locked");

    const lockPath = path.join(project.dir, "kit.lock.json");
    const written = JSON.parse(readFileSync(lockPath, "utf8"));
    written.items["@ja3dan/chip"].computedHash = "0".repeat(64);
    writeFileSync(lockPath, JSON.stringify(written));

    expect(await find("chip")).toMatchObject({ baseChanged: true });
  });

  test("changes nothing on disk", async () => {
    registry.publish(chip("1.0.0"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);
    appendFileSync(path.join(project.dir, "ui", "chip.tsx"), "// local tweak\n");
    commit(project, "state before status");
    registry.publish(chip("1.1.0"));

    await status(project.dir);
    const dirty = Bun.spawnSync(["git", "status", "--porcelain"], { cwd: project.dir }).stdout.toString();
    expect(dirty).toBe("");
  });

  test("asks for a lock rather than guessing without one", async () => {
    registry.publish(chip("1.0.0"));
    await install(project, "@ja3dan/chip");
    await expect(status(project.dir)).rejects.toThrow("Run `kit lock` first");
  });
});

test("bumpBetween", () => {
  expect(bumpBetween("1.0.0", "1.0.0")).toBe("none");
  expect(bumpBetween("1.2.0", "1.1.9")).toBe("none");
  expect(bumpBetween("1.0.0", "1.0.3")).toBe("patch");
  expect(bumpBetween("1.0.9", "1.1.0")).toBe("minor");
  expect(bumpBetween("1.9.9", "2.0.0")).toBe("major");
});
