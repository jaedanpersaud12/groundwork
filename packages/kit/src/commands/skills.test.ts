import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { readSkills } from "../assets";
import { readLock, writeLock } from "../lockfile";
import { createProject, type Project } from "../testing/fixture";
import { skillsStatus, skillsUpdate } from "./skills";

let project: Project;
const bundled = readSkills();
const hash = (content: string) => createHash("sha256").update(content).digest("hex");
const file = (name: string) => path.join(project.dir, ".claude", "skills", name, "SKILL.md");

/** A project as `kit init` from an older kit left it: every skill installed at "old" content, locked. */
function installOld(names: string[]) {
  const skills: Record<string, { source: string; sourceType: "kit"; version: string; computedHash: string }> = {};
  for (const name of names) {
    const content = `---\nname: ${name}\n---\nold ${name}\n`;
    mkdirSync(path.dirname(file(name)), { recursive: true });
    writeFileSync(file(name), content);
    skills[name] = { source: "@ja3dan/kit", sourceType: "kit", version: "0.1.0", computedHash: hash(content) };
  }
  writeLock(project.dir, { version: 1, registries: {}, items: {}, skills });
}

beforeEach(() => {
  project = createProject("http://localhost:1");
});

afterEach(() => {
  project.remove();
});

describe("kit skills", () => {
  test("status sorts each skill into outdated, edited, missing, new and retired", () => {
    const [a, b, c, d] = bundled.map((skill) => skill.name);
    installOld([a, b, c]);
    writeFileSync(file(b), "edited by the project\n");
    rmSync(file(c));
    const lock = readLock(project.dir)!;
    writeLock(project.dir, { ...lock, skills: { ...lock.skills, "gone-skill": { source: "@ja3dan/kit", sourceType: "kit", version: "0.1.0", computedHash: "x" } } });

    const byName = Object.fromEntries(skillsStatus(project.dir).map((status) => [status.name, status.state]));
    expect(byName[a]).toBe("outdated");
    expect(byName[b]).toBe("edited");
    expect(byName[c]).toBe("missing");
    expect(byName[d]).toBe("new");
    expect(byName["gone-skill"]).toBe("retired");
  });

  test("update installs outdated, missing and new skills, leaves edited ones, and re-locks", () => {
    const [a, b, c] = bundled.map((skill) => skill.name);
    installOld([a, b]);
    writeFileSync(file(b), "edited by the project\n");

    const result = skillsUpdate(project.dir);
    expect(result.skippedEdited).toEqual([b]);
    expect(result.updated).toContain(a);
    expect(result.updated).toContain(c);
    expect(readFileSync(file(a), "utf8")).toBe(bundled[0].content);
    expect(readFileSync(file(b), "utf8")).toBe("edited by the project\n");
    expect(existsSync(file(c))).toBe(true);

    const lock = readLock(project.dir)!;
    expect(lock.skills![a].computedHash).toBe(hash(bundled[0].content));
    expect(lock.skills![b].version).toBe("0.1.0");
    expect(skillsStatus(project.dir).filter((status) => status.state !== "current").map((status) => status.name)).toEqual([b]);
  });

  test("--force takes this kit's version of an edited skill; names narrow the update", () => {
    const [a, b] = bundled.map((skill) => skill.name);
    installOld([a, b]);
    writeFileSync(file(a), "edited\n");

    const result = skillsUpdate(project.dir, { names: [a], force: true });
    expect(result.updated).toEqual([a]);
    expect(readFileSync(file(a), "utf8")).toBe(bundled[0].content);
    expect(readFileSync(file(b), "utf8")).toContain("old");
  });

  test("refuses without a lock, and on a skill name this kit doesn't ship", () => {
    expect(() => skillsStatus(project.dir)).toThrow("kit.lock.json");
    installOld([bundled[0].name]);
    expect(() => skillsUpdate(project.dir, { names: ["nope"] })).toThrow("no skill named nope");
  });
});
