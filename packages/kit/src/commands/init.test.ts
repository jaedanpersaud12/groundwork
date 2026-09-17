import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { init } from "./init";

describe("kit init", () => {
  test("in a directory with no app, fails before writing anything and says to create one", async () => {
    const empty = mkdtempSync(path.join(tmpdir(), "kit-init-empty-"));
    try {
      await expect(init(empty, "next16-insforge", { url: "http://localhost:1" })).rejects.toThrow("create-next-app");
      expect(existsSync(path.join(empty, "context"))).toBe(false);
      expect(existsSync(path.join(empty, ".claude"))).toBe(false);
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });
});
