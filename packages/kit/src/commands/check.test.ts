import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { requiredTokens, shadows } from "@ja3dan/tokens/validate";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { createProject, type Project } from "../testing/fixture";
import { LIGHT_ONLY_MARKER, tokensCheck } from "./check";

const block = (selector: string): string => {
  const names = [...requiredTokens, ...Object.entries(shadows).filter(([, spec]) => spec.required).map(([name]) => `depth-${name}`)];
  return `${selector} {\n${names.map((name) => `  --${name}: red;`).join("\n")}\n}\n`;
};

let project: Project;

beforeEach(() => {
  project = createProject("http://localhost:1");
});

afterEach(() => {
  project.remove();
});

const writeCss = (css: string) => writeFileSync(path.join(project.dir, "app", "globals.css"), css);

describe("tokensCheck", () => {
  test("a light theme with no .dark block fails, and names .dark", () => {
    writeCss(block(":root"));
    const problems = tokensCheck(project.dir);
    expect(problems.map((problem) => problem.selector)).toEqual([".dark"]);
  });

  test("the light-only marker lets a theme skip .dark on purpose", () => {
    writeCss(`/* ${LIGHT_ONLY_MARKER} */\n${block(":root")}`);
    expect(tokensCheck(project.dir)).toEqual([]);
  });

  test("the marker doesn't excuse a :root that's missing tokens", () => {
    writeCss(`/* ${LIGHT_ONLY_MARKER} */\n:root { --background: white; }\n`);
    expect(tokensCheck(project.dir).map((problem) => problem.selector)).toEqual([":root"]);
  });

  test("a full light and dark theme passes", () => {
    writeCss(`${block(":root")}${block(".dark")}`);
    expect(tokensCheck(project.dir)).toEqual([]);
  });
});
