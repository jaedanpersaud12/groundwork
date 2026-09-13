import { execFile } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

async function git(cwd: string, args: string[]): Promise<string> {
  try {
    return (await run("git", args, { cwd, maxBuffer: 64 * 1024 * 1024 })).stdout;
  } catch (error) {
    const { stderr, message } = error as { stderr?: string; message: string };
    throw new Error(`git ${args.join(" ")} failed: ${(stderr || message).trim()}`);
  }
}

async function isRepo(cwd: string): Promise<boolean> {
  try {
    return (await git(cwd, ["rev-parse", "--is-inside-work-tree"])).trim() === "true";
  } catch {
    return false;
  }
}

/** Paths with uncommitted changes, untracked files included. */
async function dirtyPaths(cwd: string): Promise<string[]> {
  return (await git(cwd, ["status", "--porcelain"]))
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3));
}

async function branchExists(cwd: string, branch: string): Promise<boolean> {
  try {
    await git(cwd, ["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`]);
    return true;
  } catch {
    return false;
  }
}

async function createBranch(cwd: string, branch: string): Promise<void> {
  await git(cwd, ["checkout", "-q", "-b", branch]);
}

async function commitAll(cwd: string, message: string): Promise<void> {
  await git(cwd, ["add", "-A"]);
  await git(cwd, ["commit", "-q", "-m", message]);
}

type MergeResult = { content: string; conflicts: number };

/**
 * A 3-way merge of one file's text through `git merge-file`, so conflicts look exactly like
 * git's own — labelled `project` (the copy on disk), `base` (the locked version) and
 * `registry` (the version being installed) — and every editor already knows how to resolve
 * them. Exit status is the conflict count, which is why a non-zero exit isn't an error here.
 */
async function mergeFile(ours: string, base: string, theirs: string): Promise<MergeResult> {
  const dir = mkdtempSync(path.join(tmpdir(), "kit-merge-"));
  try {
    const [oursPath, basePath, theirsPath] = ["project", "base", "registry"].map((name) => path.join(dir, name));
    writeFileSync(oursPath, ours);
    writeFileSync(basePath, base);
    writeFileSync(theirsPath, theirs);
    try {
      const { stdout } = await run("git", ["merge-file", "-p", "-L", "project", "-L", "base", "-L", "registry", oursPath, basePath, theirsPath], {
        maxBuffer: 64 * 1024 * 1024,
      });
      return { content: stdout, conflicts: 0 };
    } catch (error) {
      const { code, stdout } = error as { code?: number; stdout?: string };
      if (typeof code === "number" && code > 0 && code < 128 && typeof stdout === "string") {
        return { content: stdout, conflicts: code };
      }
      throw error;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export { branchExists, commitAll, createBranch, dirtyPaths, isRepo, mergeFile, type MergeResult };
