import { describe, expect, test } from "bun:test";

import { readSkills, readTemplate, resolveAssetsRoot } from "./assets";

describe("resolveAssetsRoot", () => {
  test("falls back to the monorepo root when running from source", () => {
    // Running from src/ under bun test, dist/skills doesn't exist yet — this is the fallback path.
    const root = resolveAssetsRoot();
    expect(readTemplate("next16-insforge").length).toBeGreaterThan(0);
    expect(root.endsWith("groundwork") || root.endsWith("dist")).toBe(true);
  });
});

describe("readSkills", () => {
  test("reads exactly the 6 lifecycle skills, each with real SKILL.md content", () => {
    const skills = readSkills();
    expect(skills.map((skill) => skill.name)).toEqual(["architect", "feature", "harvest", "recover", "remember", "review"]);
    for (const skill of skills) {
      expect(skill.content).toContain("---");
      expect(skill.content.length).toBeGreaterThan(100);
    }
  });
});

describe("readTemplate", () => {
  test("reads every file in the next16-insforge preset", () => {
    const files = readTemplate("next16-insforge").map((file) => file.path).sort();
    expect(files).toEqual([
      "code-standards.md",
      "features/README.md",
      "library-docs.md",
      "progress.md",
      "ui-rules.md",
    ]);
  });

  test("throws for a preset that doesn't exist", () => {
    expect(() => readTemplate("does-not-exist")).toThrow();
  });
});
