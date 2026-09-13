import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { readLock } from "../lockfile";
import { commit, createProject, install, startRegistry, type FixtureItem, type Project, type Registry } from "../testing/fixture";
import { lock } from "./lock";

const chip = (version: string, body: string): FixtureItem => ({
  name: "chip",
  version,
  track: "minor",
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

describe("kit lock", () => {
  test("locks every installed item with version, track and the hash versions.json records", async () => {
    registry.publish(chip("1.0.0", "export const Chip = 1;"));
    registry.publish(badge("1.0.0"));
    await install(project, "@ja3dan/chip", "@ja3dan/badge");

    const { lock: written, items } = await lock(project.dir);
    const versions = await (await fetch(`${registry.url}/r/versions.json`)).json();

    expect(written.items).toEqual({
      "@ja3dan/badge": { source: "@ja3dan", sourceType: "registry", version: "1.0.0", track: "patch", computedHash: versions.badge.hash },
      "@ja3dan/chip": { source: "@ja3dan", sourceType: "registry", version: "1.0.0", track: "minor", computedHash: versions.chip.hash },
    });
    expect(written.registries).toEqual({ "@ja3dan": `${registry.url}/r/{name}.json` });
    expect(items.map((item) => item.match)).toEqual(["current", "current"]);
    expect(readLock(project.dir)).toEqual(written);
  });

  test("leaves out items that aren't installed", async () => {
    registry.publish(chip("1.0.0", "export const Chip = 1;"));
    registry.publish(badge("1.0.0"));
    await install(project, "@ja3dan/chip");

    const { lock: written } = await lock(project.dir);
    expect(Object.keys(written.items)).toEqual(["@ja3dan/chip"]);
  });

  test("a project behind the registry is locked at the version it actually has, not the current one", async () => {
    registry.publish(chip("1.0.0", "export const Chip = 1;"));
    await install(project, "@ja3dan/chip");
    registry.publish(chip("1.1.0", "export const Chip = 2;"));

    const { lock: written, items } = await lock(project.dir);
    const versions = await (await fetch(`${registry.url}/r/versions.json`)).json();

    expect(written.items["@ja3dan/chip"].version).toBe("1.0.0");
    expect(written.items["@ja3dan/chip"].computedHash).toBe(versions.chip.history["1.0.0"]);
    expect(written.items["@ja3dan/chip"].computedHash).not.toBe(versions.chip.hash);
    expect(items[0].match).toBe("past");
  });

  test("an edited copy is locked at the closest version and reported as edited", async () => {
    registry.publish(chip("1.0.0", "export const Chip = 1;"));
    await install(project, "@ja3dan/chip");
    registry.publish(chip("2.0.0", "export const Chip = 2;\nexport const Extra = true;"));
    appendFileSync(path.join(project.dir, "ui", "chip.tsx"), "// local tweak\n");

    const { lock: written, items } = await lock(project.dir);
    expect(written.items["@ja3dan/chip"].version).toBe("1.0.0");
    expect(items[0].match).toBe("edited");
  });

  test("refuses to replace an existing lock without --force", async () => {
    registry.publish(chip("1.0.0", "export const Chip = 1;"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);
    commit(project, "locked");

    await expect(lock(project.dir)).rejects.toThrow("already exists");
    const before = readFileSync(path.join(project.dir, "kit.lock.json"), "utf8");
    await lock(project.dir, { force: true });
    expect(readFileSync(path.join(project.dir, "kit.lock.json"), "utf8")).toBe(before);
  });

  test("explains a project with no @ja3dan registry instead of failing on a fetch", async () => {
    const bare = createProject(registry.url);
    const components = path.join(bare.dir, "components.json");
    const config = JSON.parse(readFileSync(components, "utf8"));
    delete config.registries;
    await Bun.write(components, JSON.stringify(config));
    try {
      await expect(lock(bare.dir)).rejects.toThrow('no "@ja3dan" registry');
      expect(existsSync(path.join(bare.dir, "kit.lock.json"))).toBe(false);
    } finally {
      bare.remove();
    }
  });
});
