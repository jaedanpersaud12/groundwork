import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { commit, createProject, type Project } from "../testing/fixture";
import { ignoredKitFiles, kickoffOutputChecks } from "./doctor";

let project: Project;

beforeEach(() => {
  project = createProject("http://localhost:1");
});

afterEach(() => {
  project.remove();
});

const write = (rel: string, content: string) => {
  const full = path.join(project.dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
};

const OVERVIEW = [
  "About the Project",
  "The Problem It Solves",
  "Pages",
  "Navigation",
  "Core User Flow",
  "Data Ownership",
  "Features In Scope",
  "Features Out of Scope",
  "Target User",
  "Success Criteria",
]
  .map((name) => `## ${name}\n\ntext\n`)
  .join("\n");
const ARCHITECTURE = ["1. Stack", "2. Folder Structure", "System Boundaries", "Data Flow", "Database Schema", "Invariants"]
  .map((name) => `## ${name}\n`)
  .join("\n");
const BUILD_PLAN = "## Core Principle\n\n## Phase 1 — Launch\n\n### 01 Homepage\n";

describe("kickoffOutputChecks", () => {
  test("missing outputs are pending, not failures, before any feature folder exists", () => {
    const results = kickoffOutputChecks(project.dir);
    expect(results.map((result) => [result.ok, result.pending])).toEqual([
      [true, true],
      [true, true],
      [true, true],
    ]);
  });

  test("once a feature has started, a missing output fails and names the prompt that writes it", () => {
    mkdirSync(path.join(project.dir, "context", "features", "01-homepage"), { recursive: true });
    const [overview] = kickoffOutputChecks(project.dir);
    expect(overview.ok).toBe(false);
    expect(overview.detail).toContain("01-interview");
  });

  test("an output missing required sections fails and lists them", () => {
    write("context/project-overview.md", "## About the Project\n\n## Pages\n");
    const [overview] = kickoffOutputChecks(project.dir);
    expect(overview.ok).toBe(false);
    expect(overview.detail).toContain("Navigation");
    expect(overview.detail).not.toContain("About the Project");
  });

  test("complete outputs pass, numbered architecture headings included", () => {
    write("context/project-overview.md", OVERVIEW);
    write("context/architecture.md", ARCHITECTURE);
    write("context/build-plan.md", BUILD_PLAN);
    expect(kickoffOutputChecks(project.dir).every((result) => result.ok && !result.pending)).toBe(true);
  });
});

describe("ignoredKitFiles", () => {
  test("passes when nothing of the kit's is ignored", () => {
    expect(ignoredKitFiles(project.dir)).toEqual([{ label: "kit's files aren't git-ignored", ok: true, detail: null }]);
  });

  test("fails on a bare .claude rule, naming the files and the fix", () => {
    write(".gitignore", "node_modules\n.claude\n");
    commit(project, "ignore");
    const [result] = ignoredKitFiles(project.dir);
    expect(result.ok).toBe(false);
    expect(result.detail).toContain(".claude/skills/review/SKILL.md");
    expect(result.detail).toContain("git check-ignore -v");
    expect(result.detail).not.toContain("kit.lock.json");
  });
});
