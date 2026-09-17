import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import pkg from "../../package.json" with { type: "json" };
import { readSkills } from "../assets";
import { LOCK_FILE, readLock, writeLock, type SkillEntry } from "../lockfile";

/**
 * `current`: the installed file is this kit's version. `outdated`: unedited since it was locked, and
 * this kit ships a different one. `edited`: changed locally since it was locked — updating would lose
 * that, so it needs `--force`. `missing`: locked but the file is gone. `new`: this kit ships a skill
 * the project has never had. `retired`: locked, but this kit no longer ships it (left in place).
 */
type SkillState = "current" | "outdated" | "edited" | "missing" | "new" | "retired";

type SkillStatus = { name: string; state: SkillState; locked: string | null };

const hash = (content: string) => createHash("sha256").update(content).digest("hex");
const skillPath = (cwd: string, name: string) => path.join(cwd, ".claude", "skills", name, "SKILL.md");

function requireLock(cwd: string) {
  const lock = readLock(cwd);
  if (!lock) throw new Error(`No ${LOCK_FILE} in ${cwd}. Skills are tracked by the lock \`kit init\` writes — run \`kit init\` (new project) or \`kit lock\` first.`);
  return lock;
}

function skillsStatus(cwd: string): SkillStatus[] {
  const lock = requireLock(cwd);
  const locked = lock.skills ?? {};
  const bundled = readSkills();
  const statuses: SkillStatus[] = bundled.map((skill) => {
    const entry = locked[skill.name];
    const file = skillPath(cwd, skill.name);
    if (!existsSync(file)) return { name: skill.name, state: entry ? "missing" : "new", locked: entry?.version ?? null };
    const onDisk = hash(readFileSync(file, "utf8"));
    if (onDisk === hash(skill.content)) return { name: skill.name, state: "current", locked: entry?.version ?? null };
    // No lock entry for a file that exists means someone put it there by hand: treat as edited.
    if (!entry || onDisk !== entry.computedHash) return { name: skill.name, state: "edited", locked: entry?.version ?? null };
    return { name: skill.name, state: "outdated", locked: entry.version };
  });
  const bundledNames = new Set(bundled.map((skill) => skill.name));
  for (const [name, entry] of Object.entries(locked)) {
    if (!bundledNames.has(name)) statuses.push({ name, state: "retired", locked: entry.version });
  }
  return statuses.sort((a, b) => a.name.localeCompare(b.name));
}

type SkillsUpdateResult = { updated: string[]; skippedEdited: string[] };

/**
 * Brings the project's skills to this kit's versions and re-locks them. Edited skills are left alone
 * unless `force` — a project's own changes to a skill are a decision, not drift.
 */
function skillsUpdate(cwd: string, { names = [], force = false }: { names?: string[]; force?: boolean } = {}): SkillsUpdateResult {
  const lock = requireLock(cwd);
  const bundled = new Map(readSkills().map((skill) => [skill.name, skill]));
  const unknown = names.filter((name) => !bundled.has(name));
  if (unknown.length) throw new Error(`This kit ships no skill named ${unknown.join(", ")}. \`kit skills status\` lists them.`);

  const wanted = new Set(names);
  const updated: string[] = [];
  const skippedEdited: string[] = [];
  const skills: Record<string, SkillEntry> = { ...(lock.skills ?? {}) };

  for (const status of skillsStatus(cwd)) {
    if (wanted.size && !wanted.has(status.name)) continue;
    const skill = bundled.get(status.name);
    if (!skill) continue;
    if (status.state === "edited" && !force) {
      skippedEdited.push(status.name);
      continue;
    }
    if (status.state !== "current") {
      const file = skillPath(cwd, status.name);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, skill.content);
      updated.push(status.name);
    }
    skills[status.name] = { source: "@ja3dan/kit", sourceType: "kit", version: pkg.version, computedHash: hash(skill.content) };
  }
  writeLock(cwd, { ...lock, skills });
  return { updated, skippedEdited };
}

/** Skill folders on disk that neither the kit nor the lock knows — a project's own skills. Reported, never touched. */
function projectOwnSkills(cwd: string): string[] {
  const dir = path.join(cwd, ".claude", "skills");
  if (!existsSync(dir)) return [];
  const known = new Set([...readSkills().map((skill) => skill.name), ...Object.keys(readLock(cwd)?.skills ?? {})]);
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !known.has(entry.name))
    .map((entry) => entry.name);
}

export { projectOwnSkills, skillsStatus, skillsUpdate, type SkillState, type SkillStatus, type SkillsUpdateResult };
