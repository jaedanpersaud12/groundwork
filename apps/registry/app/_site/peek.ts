import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import type { Peek } from "./file-peek";
import { highlight, langFor } from "./highlight";
import { ROOT } from "./repo";
import type { TreeNode } from "./tree-nodes";

/**
 * The first lines of a file, read from the repo and highlighted on the server, for the
 * hover card a file name opens anywhere on the site. A card only ever shows the file the name
 * actually is. A name in a project that doesn't exist yet gets one only when kit init copies
 * that file verbatim from the preset; a file some later step writes (a spec, a build plan)
 * has no content yet, and showing another project's copy in its place reads as a wrong file.
 */

/** Enough to recognise a file by; the card fades out below this. */
const LINES = 14;

const PRESET = "templates/next16-insforge";
const PROJECT_ROOTS = /^(your-project|your-app)\//;

function isFile(rel: string): boolean {
  const full = path.join(ROOT, rel);
  return existsSync(full) && statSync(full).isFile();
}

/**
 * A path as the site draws it (a tree's title plus the row, or a name in running copy) to the
 * repo file that shows what it holds, or null when there's nothing honest to show.
 */
function resolve(drawn: string): string | null {
  const clean = drawn.replace(/\/{2,}/g, "/");
  if (clean.endsWith("/")) return null;
  const inProject = PROJECT_ROOTS.test(clean);
  const rel = clean.replace(PROJECT_ROOTS, "").replace(/^groundwork\//, "");

  if (inProject) {
    // Only what kit init copies into a new project's context/ exists before anyone writes it.
    const inContext = /^context\/(.+)$/.exec(rel)?.[1];
    return inContext && isFile(`${PRESET}/${inContext}`) ? `${PRESET}/${inContext}` : null;
  }
  return isFile(rel) ? rel : null;
}

const cache = new Map<string, Promise<Peek>>();

function build(rel: string): Promise<Peek> {
  let peek = cache.get(rel);
  if (!peek) {
    peek = (async () => {
      const all = readFileSync(path.join(ROOT, rel), "utf8").replace(/\n+$/, "").split("\n");
      const lang = langFor(rel);
      return {
        path: rel,
        lines: all.length,
        truncated: all.length > LINES,
        prose: lang === "markdown",
        html: await highlight(all.slice(0, LINES).join("\n"), lang),
      };
    })();
    cache.set(rel, peek);
  }
  return peek;
}

/** A peek for a path the page names outright. Throws if it names nothing, so a moved file fails the build. */
async function peekFile(drawn: string): Promise<Peek> {
  const rel = resolve(drawn);
  if (!rel) throw new Error(`No file in the repo to preview for "${drawn}".`);
  return build(rel);
}

/** Peeks for every row of a tree that has a real file behind it, keyed by row id. */
async function treePeeks(root: string, nodes: TreeNode[]): Promise<Record<string, Peek>> {
  const rows: TreeNode[] = [];
  const walk = (list: TreeNode[]) => list.forEach((node) => (rows.push(node), walk(node.children ?? [])));
  walk(nodes);
  const found = await Promise.all(
    rows.map(async (node) => {
      const rel = node.children?.length ? null : resolve(`${root}/${node.id}`);
      return rel ? ([node.id, await build(rel)] as const) : null;
    }),
  );
  return Object.fromEntries(found.filter((entry) => entry !== null));
}

export { peekFile, treePeeks };
