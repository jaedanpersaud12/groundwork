import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { Track } from "./registry";

/**
 * `kit.lock.json` deliberately has the shape of `skills-lock.json` — `version`, then per
 * entry `source`, `sourceType` and `computedHash` — so that the day registry items and
 * skills share one lock, merging the files is mechanical rather than a migration. Decided
 * in 04's plan; kit never writes `skills-lock.json` itself.
 */
type LockEntry = {
  source: string;
  sourceType: "registry";
  version: string;
  track: Track;
  computedHash: string;
};

/**
 * `kit init`'s half of the shape the comment above promised. `sourceType: "kit"` means
 * "bundled in the installing kit's own package" — groundwork's `skills/` has no external
 * repo to point at the way jobpilot's real `skills-lock.json` did (`sourceType: "github"`).
 * A future GitHub-sourced skill is a new `sourceType` value, not a schema change.
 */
type SkillEntry = {
  source: string;
  sourceType: "kit";
  version: string;
  computedHash: string;
};

type Lock = {
  version: 1;
  registries: Record<string, string>;
  items: Record<string, LockEntry>;
  skills?: Record<string, SkillEntry>;
};

const LOCK_FILE = "kit.lock.json";

const lockPath = (cwd: string) => path.join(cwd, LOCK_FILE);

function readLock(cwd: string): Lock | null {
  if (!existsSync(lockPath(cwd))) return null;
  const lock = JSON.parse(readFileSync(lockPath(cwd), "utf8")) as Lock;
  if (lock.version !== 1) throw new Error(`${LOCK_FILE} is version ${lock.version}; this kit reads version 1.`);
  return lock;
}

/** Items (and skills, if any) sorted by key, so adding one is a one-entry diff rather than a reshuffle. */
function writeLock(cwd: string, lock: Lock): void {
  const items = Object.fromEntries(Object.entries(lock.items).sort(([a], [b]) => a.localeCompare(b)));
  const skills = lock.skills ? Object.fromEntries(Object.entries(lock.skills).sort(([a], [b]) => a.localeCompare(b))) : undefined;
  writeFileSync(lockPath(cwd), `${JSON.stringify({ ...lock, items, ...(skills ? { skills } : {}) }, null, 2)}\n`);
}

export { LOCK_FILE, lockPath, readLock, writeLock, type Lock, type LockEntry, type SkillEntry };
