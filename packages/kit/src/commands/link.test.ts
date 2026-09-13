import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { viewFile } from "../shadcn";
import { commit, createProject, install, startRegistry, type FixtureItem, type Project, type Registry } from "../testing/fixture";
import { link, unlink } from "./link";

const button = (label: string): FixtureItem => ({
  name: "button",
  version: "1.0.0",
  files: [{ path: "registry/groundwork/ui/button.tsx", content: `export const label = "${label}";\n` }],
});

/** Two registries: `published` stands for the deployed one, `local` for the dev server with an unreleased edit. */
let published: Registry;
let local: Registry;
let project: Project;

const components = () => readFileSync(path.join(project.dir, "components.json"), "utf8");
const git = (...args: string[]) => Bun.spawnSync(["git", ...args], { cwd: project.dir }).stdout.toString().trim();

beforeEach(async () => {
  published = await startRegistry();
  local = await startRegistry();
  published.publish(button("published"));
  // Same version number, different content: exactly what an unpublished working-tree change looks like.
  local.publish(button("unreleased"));
  project = createProject(published.url);
});

afterEach(async () => {
  project.remove();
  await Promise.all([published.close(), local.close()]);
});

describe("kit link", () => {
  // Spec criterion 6: @ja3dan resolves from the local registry, and an unpublished change appears.
  test("points @ja3dan at the local registry, and an unpublished change appears in the project", async () => {
    const result = await link(project.dir, { url: local.url });
    expect(result).toEqual({ from: `${published.url}/r/{name}.json`, to: `${local.url}/r/{name}.json`, changed: true });

    await install(project, "@ja3dan/button");
    expect(readFileSync(path.join(project.dir, "ui", "button.tsx"), "utf8")).toBe('export const label = "unreleased";\n');
  });

  test("changes exactly one line of components.json", async () => {
    await link(project.dir, { url: local.url });
    const diff = git("diff", "--numstat", "components.json");
    expect(diff).toBe("1\t1\tcomponents.json");
  });

  test("--off restores the committed URL exactly, and the published content comes back", async () => {
    const before = components();
    await link(project.dir, { url: local.url });
    const off = await unlink(project.dir);

    expect(off).toMatchObject({ to: `${published.url}/r/{name}.json`, changed: true });
    expect(components()).toBe(before);
    expect(git("status", "--porcelain")).toBe("");
    expect(await viewFile(project.dir, "@ja3dan/button", "ui/button.tsx")).toBe('export const label = "published";\n');
  });

  test("refuses to link over uncommitted changes to components.json", async () => {
    writeFileSync(path.join(project.dir, "components.json"), components().replace('"rsc": true', '"rsc": false'));
    await expect(link(project.dir, { url: local.url })).rejects.toThrow("components.json has uncommitted changes");
  });

  test("linking twice, or unlinking when not linked, changes nothing", async () => {
    await link(project.dir, { url: local.url });
    commit(project, "linked on purpose");
    expect(await link(project.dir, { url: local.url })).toMatchObject({ changed: false });

    const fresh = createProject(published.url);
    try {
      expect(await unlink(fresh.dir)).toMatchObject({ changed: false });
    } finally {
      fresh.remove();
    }
  });

  test("defaults to the registry dev server on :3100", async () => {
    const result = await link(project.dir);
    expect(result.to).toBe("http://localhost:3100/r/{name}.json");
  });

  // Regression: `git status`/`git show HEAD:` resolve paths from the repo root, not from cwd.
  // A project living in a subdirectory of a larger repo — which `--cwd` allows — needs its
  // own dirty check and its own restore to address that subdirectory, not the repo root.
  test("works when the project is a subdirectory of a larger repo, not the repo root", async () => {
    const outer = mkdtempSync(path.join(tmpdir(), "kit-outer-"));
    const sub = path.join(outer, "apps", "web");
    const outerGit = (...args: string[]) => execFileSync("git", args, { cwd: outer, stdio: "ignore" });
    try {
      outerGit("init", "-q");
      outerGit("config", "user.name", "fixture");
      outerGit("config", "user.email", "fixture@example.com");
      mkdirSync(sub, { recursive: true });
      writeFileSync(path.join(outer, "README.md"), "outer repo, unrelated to the linked project\n");
      const componentsJson = `${JSON.stringify({ registries: { "@ja3dan": `${published.url}/r/{name}.json` } }, null, 2)}\n`;
      writeFileSync(path.join(sub, "components.json"), componentsJson);
      outerGit("add", "-A");
      outerGit("commit", "-qm", "init");

      const result = await link(sub, { url: local.url });
      expect(result).toEqual({ from: `${published.url}/r/{name}.json`, to: `${local.url}/r/{name}.json`, changed: true });

      const off = await unlink(sub);
      expect(off).toMatchObject({ to: `${published.url}/r/{name}.json`, changed: true });
      expect(readFileSync(path.join(sub, "components.json"), "utf8")).toBe(componentsJson);
    } finally {
      rmSync(outer, { recursive: true, force: true });
    }
  });

  test("refuses to link a subdirectory project over an uncommitted components.json", async () => {
    const outer = mkdtempSync(path.join(tmpdir(), "kit-outer-"));
    const sub = path.join(outer, "apps", "web");
    const outerGit = (...args: string[]) => execFileSync("git", args, { cwd: outer, stdio: "ignore" });
    try {
      outerGit("init", "-q");
      outerGit("config", "user.name", "fixture");
      outerGit("config", "user.email", "fixture@example.com");
      mkdirSync(sub, { recursive: true });
      writeFileSync(path.join(sub, "components.json"), `${JSON.stringify({ registries: { "@ja3dan": `${published.url}/r/{name}.json` } })}\n`);
      outerGit("add", "-A");
      outerGit("commit", "-qm", "init");
      writeFileSync(path.join(sub, "components.json"), `${JSON.stringify({ registries: { "@ja3dan": `${published.url}/r/{name}.json` }, rsc: false })}\n`);

      await expect(link(sub, { url: local.url })).rejects.toThrow("components.json has uncommitted changes");
    } finally {
      rmSync(outer, { recursive: true, force: true });
    }
  });
});
