/** The tree view's data shape, and the builder, kept out of the client module so server pages can call it. */
type TreeNode = {
  id: string;
  label: string;
  meta?: string;
  /** Quiet a row, or light it as the one the surrounding text is about. */
  tone?: "default" | "quiet" | "lit";
  children?: TreeNode[];
};

/**
 * Builds nested tree nodes from a flat, depth-indented list (the shape the site's data
 * modules use). Each id is the path to the row, so ids stay stable and unique.
 */
function nodesFromLines(lines: { name: string; depth: number; note?: string; tone?: TreeNode["tone"] }[]): TreeNode[] {
  const root: TreeNode[] = [];
  const stack: { depth: number; node: TreeNode; path: string }[] = [];
  for (const line of lines) {
    while (stack.length && stack[stack.length - 1].depth >= line.depth) stack.pop();
    const parent = stack[stack.length - 1];
    const path = parent ? `${parent.path}/${line.name}` : line.name;
    const node: TreeNode = { id: path, label: line.name, meta: line.note, tone: line.tone };
    if (parent) (parent.node.children ??= []).push(node);
    else root.push(node);
    stack.push({ depth: line.depth, node, path });
  }
  return root;
}

type NestedLike = { name: string; note?: string; children?: NestedLike[] };

/** Tree nodes from an already nested shape (the `{ name, note, children }` trees in kit.ts). */
function nodesFromNested(nodes: NestedLike[], parent = ""): TreeNode[] {
  return nodes.map((node) => {
    const id = parent ? `${parent}/${node.name}` : node.name;
    return { id, label: node.name, meta: node.note, children: node.children ? nodesFromNested(node.children, id) : undefined };
  });
}

export { nodesFromLines, nodesFromNested, type NestedLike, type TreeNode };
