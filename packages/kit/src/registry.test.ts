import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { baseOf, bySemver, hashItem, type RegistryItem, type VersionIndex } from "./registry";

const PUBLIC_R = path.join(import.meta.dir, "..", "..", "..", "apps", "registry", "public", "r");

describe("hashItem", () => {
  /**
   * kit's hash has to be the registry build's hash, or every lock it writes disagrees with
   * `versions.json`. Checked against every version the real registry has ever published.
   */
  test("matches versions.json for every file in the real public/r/v", () => {
    const versions = JSON.parse(readFileSync(path.join(PUBLIC_R, "versions.json"), "utf8")) as VersionIndex;
    const files = readdirSync(path.join(PUBLIC_R, "v")).filter((file) => file.endsWith(".json"));
    expect(files.length).toBeGreaterThan(20);

    for (const file of files) {
      const [, name, version] = /^(.+)@(\d+\.\d+\.\d+)\.json$/.exec(file)!;
      const item = JSON.parse(readFileSync(path.join(PUBLIC_R, "v", file), "utf8")) as RegistryItem;
      expect({ file, hash: hashItem(item) }).toEqual({ file, hash: versions[name].history[version] });
    }
  });
});

describe("baseOf", () => {
  test("strips /r/{name}.json", () => {
    expect(baseOf("https://gw.jaedan.me/r/{name}.json")).toBe("https://gw.jaedan.me");
  });

  test("refuses a template kit can't derive versioned URLs from", () => {
    expect(() => baseOf("https://example.com/{name}")).toThrow("/r/{name}.json");
  });
});

test("bySemver orders numerically", () => {
  expect(["1.0.10", "1.0.9", "2.0.0", "1.10.0"].sort(bySemver)).toEqual(["1.0.9", "1.0.10", "1.10.0", "2.0.0"]);
});
