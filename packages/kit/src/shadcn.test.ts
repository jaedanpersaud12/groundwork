import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { parsePlan, parseView, planAdd, viewFile } from "./shadcn";
import { createProject, startRegistry, type Project, type Registry } from "./testing/fixture";

/**
 * The contract kit depends on and shadcn doesn't document: the shape of `add --dry-run`
 * output. These tests run the pinned shadcn against a fabricated registry, so when an
 * upgrade changes the format they fail here, by name, rather than somewhere inside a merge.
 */

// Registry dialect in, project dialect expected out. The blank lines and the trailing newline
// are there on purpose: they're where a prefix-stripping parser goes wrong.
const CHIP_SOURCE = `import { cn } from "@/lib/utils";
import { STILL } from "@/registry/groundwork/lib/motion";

export function Chip() {

  return cn(STILL);
}
`;
const CHIP_INSTALLED = CHIP_SOURCE.replace("@/lib/utils", "@/shared/cn").replace(
  "@/registry/groundwork/lib/motion",
  "@/shared/motion",
);

let registry: Registry;
let project: Project;

beforeAll(async () => {
  registry = await startRegistry();
  registry.publish({
    name: "chip",
    version: "1.0.0",
    files: [{ path: "registry/groundwork/ui/chip.tsx", content: CHIP_SOURCE }],
  });
  project = createProject(registry.url);
});

afterAll(async () => {
  project?.remove();
  await registry?.close();
});

describe("shadcn --dry-run output (pinned format)", () => {
  test("planAdd lists each file with its project path and what add would do", async () => {
    expect(await planAdd(project.dir, `${registry.url}/r/v/chip@1.0.0.json`)).toEqual([
      { path: "ui/chip.tsx", status: "create" },
    ]);
  });

  test("viewFile returns the file byte-for-byte as add would write it, aliases rewritten", async () => {
    const viewed = await viewFile(project.dir, `${registry.url}/r/v/chip@1.0.0.json`, "ui/chip.tsx");
    expect(viewed).toBe(CHIP_INSTALLED);
  });

  test("viewFile writes nothing to the project", async () => {
    await viewFile(project.dir, `${registry.url}/r/v/chip@1.0.0.json`, "ui/chip.tsx");
    expect(() => readFileSync(path.join(project.dir, "ui", "chip.tsx"))).toThrow();
  });

  test("on an edited copy, planAdd says overwrite and viewFile still returns the registry's version", async () => {
    mkdirSync(path.join(project.dir, "ui"), { recursive: true });
    writeFileSync(path.join(project.dir, "ui", "chip.tsx"), `${CHIP_INSTALLED}// edited locally\n`);

    const url = `${registry.url}/r/v/chip@1.0.0.json`;
    expect(await planAdd(project.dir, url)).toEqual([{ path: "ui/chip.tsx", status: "overwrite" }]);
    expect(await viewFile(project.dir, url, "ui/chip.tsx")).toBe(CHIP_INSTALLED);
  });
});

describe("parsers", () => {
  test("parsePlan ignores dependency lines, which share the marker but have no status", () => {
    const stdout = [
      "├ Files (2) +1 =1 skip",
      "│ + ui/chip.tsx        create",
      "│ = shared/motion.ts   skip (identical)",
      "│ ~ ui/button.tsx      overwrite",
      "├ Dependencies (1)",
      "│ + motion",
    ].join("\n");
    expect(parsePlan(stdout)).toEqual([
      { path: "ui/chip.tsx", status: "create" },
      { path: "shared/motion.ts", status: "skip" },
      { path: "ui/button.tsx", status: "overwrite" },
    ]);
  });

  test("parseView keeps empty lines and ignores the frame", () => {
    const stdout = ["├ ui/a.tsx (create) 3 lines", "│ ┌────", "│ │ one", "│ │ ", "│ │", "│ │ two", "│ └────"].join("\n");
    expect(parseView(stdout)).toBe("one\n\n\ntwo");
  });

  test("parseView returns null when there is no content, rather than an empty file", () => {
    expect(parseView("└ Run without --dry-run to apply.")).toBeNull();
  });
});
