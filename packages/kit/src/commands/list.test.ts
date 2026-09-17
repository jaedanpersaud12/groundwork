import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createProject, install, startRegistry, type FixtureItem, type Project, type Registry } from "../testing/fixture";
import { list } from "./list";
import { lock } from "./lock";

const item = (name: string, version: string): FixtureItem => ({
  name,
  version,
  track: "minor",
  files: [{ path: `registry/groundwork/ui/${name}.tsx`, content: `export const ${name.replace("-", "")} = "${version}";\n` }],
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

describe("kit list", () => {
  test("lists every installable item with its latest version, marking what the project has locked", async () => {
    registry.publish(item("chip", "1.0.0"));
    registry.publish(item("badge", "1.2.0"));
    await install(project, "@ja3dan/chip");
    await lock(project.dir);

    const items = await list(project.dir, { url: "" });
    expect(items.map((entry) => [entry.name, entry.version, entry.installed])).toEqual([
      ["badge", "1.2.0", null],
      ["chip", "1.0.0", "1.0.0"],
    ]);
  });

  test("works outside a project against an explicit registry URL", async () => {
    registry.publish(item("chip", "1.0.0"));
    const empty = mkdtempSync(path.join(tmpdir(), "kit-list-"));
    try {
      const items = await list(empty, { url: registry.url });
      expect(items.map((entry) => [entry.name, entry.installed])).toEqual([["chip", null]]);
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });
});
