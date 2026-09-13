import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { dirtyPaths } from "./git";

let dir: string;
const git = (...args: string[]) => execFileSync("git", args, { cwd: dir, stdio: "ignore" });

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "kit-git-"));
  git("init", "-q");
  git("config", "user.name", "fixture");
  git("config", "user.email", "fixture@example.com");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("dirtyPaths", () => {
  test("reports a modified file by its plain path", async () => {
    writeFileSync(path.join(dir, "a.txt"), "one\n");
    git("add", "-A");
    git("commit", "-qm", "init");
    writeFileSync(path.join(dir, "a.txt"), "two\n");

    expect(await dirtyPaths(dir)).toEqual(["a.txt"]);
  });

  test("reports an untracked file by its plain path", async () => {
    writeFileSync(path.join(dir, "b.txt"), "new\n");
    expect(await dirtyPaths(dir)).toEqual(["b.txt"]);
  });

  // Regression: `git status --porcelain` (no -z) prints a rename as one combined
  // "old -> new" record; a caller checking for one exact path — kit link, guarding
  // components.json — needs both sides of the rename, not that combined string.
  test("reports both the old and new path of a rename, not a combined 'old -> new' string", async () => {
    writeFileSync(path.join(dir, "old.json"), "similar content that git will call a rename\n");
    git("add", "-A");
    git("commit", "-qm", "init");
    git("mv", "old.json", "new.json");
    writeFileSync(path.join(dir, "new.json"), "similar content that git will call a rename, edited\n");

    const paths = await dirtyPaths(dir);
    expect(paths).toContain("new.json");
    expect(paths).toContain("old.json");
    expect(paths.some((p) => p.includes("->"))).toBe(false);
  });
});
