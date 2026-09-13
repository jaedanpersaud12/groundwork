import { execFile } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import { dirtyPaths, isRepo } from "../git";
import { baseOf, NAMESPACE } from "../registry";

const run = promisify(execFile);

/** The registry app's dev port — `.claude/launch.json` and `bun run registry:dev` both use it. */
const DEFAULT_LOCAL = "http://localhost:3100";

type LinkResult = { from: string; to: string; changed: boolean };

function templateFor(base: string): string {
  return `${base.replace(/\/$/, "")}/r/{name}.json`;
}

function readRegistryEntry(json: string): string | null {
  const entry = (JSON.parse(json) as { registries?: Record<string, string | { url?: string }> }).registries?.[NAMESPACE];
  return typeof entry === "string" ? entry : (entry?.url ?? null);
}

/**
 * Swaps the template in place rather than re-serialising `components.json`, so linking changes
 * one line and `kit link --off` puts back exactly what was there. Falls back to a full rewrite
 * only for the object form (`{ "url": … }`), which a string replace can't reach safely.
 */
function replaceTemplate(json: string, from: string, to: string): string {
  const needle = `"${NAMESPACE}": "${from}"`;
  if (json.split(needle).length === 2) return json.replace(needle, `"${NAMESPACE}": "${to}"`);
  const config = JSON.parse(json) as { registries: Record<string, string | { url?: string }> };
  const entry = config.registries[NAMESPACE];
  config.registries[NAMESPACE] = typeof entry === "string" ? to : { ...entry, url: to };
  return `${JSON.stringify(config, null, 2)}\n`;
}

/**
 * `components.json`'s path relative to the repository root — `git status --porcelain` reports
 * paths from there, never from `cwd`, so a bare `"components.json"` only matches when `cwd`
 * happens to be the repo root. `--cwd` can point at a nested project.
 */
async function repoPath(cwd: string): Promise<string> {
  return `${(await run("git", ["rev-parse", "--show-prefix"], { cwd })).stdout.trim()}components.json`;
}

/**
 * Points `@ja3dan` at a local registry so an unpublished component change can be tried in a
 * real app before it ships.
 *
 * `components.json` is committed, so a linked project carries a dirty file. That is the
 * accepted cost (see 04's plan), and the guards are what make it safe: kit won't link over
 * uncommitted changes to `components.json`, so the committed copy is always the one to
 * restore, and `--off` restores the registry URL from it rather than from anything kit
 * remembers.
 */
async function link(cwd: string, { url = DEFAULT_LOCAL }: { url?: string } = {}): Promise<LinkResult> {
  const file = path.join(cwd, "components.json");
  if (!(await isRepo(cwd))) throw new Error(`${cwd} isn't a git repository; kit link restores components.json from git.`);
  if ((await dirtyPaths(cwd)).includes(await repoPath(cwd))) {
    throw new Error("components.json has uncommitted changes. Commit or discard them first, so `kit link --off` has a clean copy to restore.");
  }

  const json = readFileSync(file, "utf8");
  const from = readRegistryEntry(json);
  if (!from) throw new Error(`components.json has no "${NAMESPACE}" registry to link.`);
  baseOf(from);

  const to = templateFor(url);
  if (from === to) return { from, to, changed: false };
  writeFileSync(file, replaceTemplate(json, from, to));
  return { from, to, changed: true };
}

/** Restores the `@ja3dan` registry URL from the committed `components.json`. */
async function unlink(cwd: string): Promise<LinkResult> {
  const file = path.join(cwd, "components.json");
  if (!(await isRepo(cwd))) throw new Error(`${cwd} isn't a git repository; kit link restores components.json from git.`);

  let committed: string;
  try {
    committed = (await run("git", ["show", "HEAD:./components.json"], { cwd })).stdout;
  } catch {
    throw new Error("components.json isn't committed, so there's no linked-from URL to restore.");
  }
  const to = readRegistryEntry(committed);
  if (!to) throw new Error(`The committed components.json has no "${NAMESPACE}" registry.`);

  const json = readFileSync(file, "utf8");
  const from = readRegistryEntry(json);
  if (!from) throw new Error(`components.json has no "${NAMESPACE}" registry.`);
  if (from === to) return { from, to, changed: false };
  writeFileSync(file, replaceTemplate(json, from, to));
  return { from, to, changed: true };
}

export { DEFAULT_LOCAL, link, unlink, type LinkResult };
