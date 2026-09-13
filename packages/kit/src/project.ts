import path from "node:path";

import type { RegistryItem } from "./registry";
import type { PlannedFile } from "./shadcn";

/**
 * Each item's own files, located in one dry run of many items at once. The dry run lists
 * dependencies' files too and doesn't say which item a file belongs to, so files are matched
 * by basename — safe because the registry's basenames are unique, and checked here so the day
 * they aren't, kit fails instead of guessing.
 */
function locateFiles(items: RegistryItem[], plan: PlannedFile[]): Map<string, PlannedFile[]> {
  const byBasename = new Map<string, PlannedFile>();
  for (const file of plan) byBasename.set(path.basename(file.path), file);

  const seen = new Map<string, string>();
  const located = new Map<string, PlannedFile[]>();
  for (const item of items) {
    located.set(
      item.name,
      item.files.map((file) => {
        const basename = path.basename(file.path);
        const owner = seen.get(basename);
        if (owner && owner !== item.name) {
          throw new Error(`${owner} and ${item.name} both ship a file named ${basename}; kit can't tell their copies apart.`);
        }
        seen.set(basename, item.name);
        const planned = byBasename.get(basename);
        if (!planned) throw new Error(`shadcn's plan didn't include ${file.path} from ${item.name}.`);
        return planned;
      }),
    );
  }
  return located;
}

/**
 * Lines in one text and not the other, counted as multisets. Crude next to a real diff, but
 * it only ranks candidate versions against each other, or says whether two texts differ.
 */
function distance(a: string, b: string): number {
  const counts = new Map<string, number>();
  for (const line of a.split("\n")) counts.set(line, (counts.get(line) ?? 0) + 1);
  for (const line of b.split("\n")) counts.set(line, (counts.get(line) ?? 0) - 1);
  let total = 0;
  for (const count of counts.values()) total += Math.abs(count);
  return total;
}

export { distance, locateFiles };
