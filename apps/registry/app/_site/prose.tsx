import type { ReactNode } from "react";

import { Toc, type TocEntry } from "./toc";

/**
 * Every docs page is the same three things: a title, a lead, and a run of sections the
 * table of contents can observe. Sharing the shell is what keeps the TOC's ids and the
 * headings' ids from drifting apart.
 */
export function DocPage({
  title,
  lead,
  toc,
  children,
}: {
  title: string;
  lead: ReactNode;
  toc: TocEntry[];
  children: ReactNode;
}) {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-12">
      <article className="min-w-0">
        <h1 className="type-display text-4xl text-foreground">{title}</h1>
        <p className="mt-4 max-w-prose text-lg text-muted-foreground">{lead}</p>
        {children}
      </article>
      <Toc entries={toc} />
    </div>
  );
}

export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-border pt-10 mt-10">
      <div className="grid gap-2">
        <h2 id={id} className="type-section scroll-mt-24 text-xl text-foreground">
          {title}
        </h2>
        {lead ? <p className="max-w-prose text-muted-foreground">{lead}</p> : null}
      </div>
      {children}
    </section>
  );
}

type TreeNodeLike = { name: string; note?: string; children?: TreeNodeLike[] };

/** A file tree, indented by nesting rather than by drawn rules. */
export function Tree({ nodes, depth = 0 }: { nodes: TreeNodeLike[]; depth?: number }) {
  return (
    <ul className={depth === 0 ? "grid gap-1" : "mt-1 grid gap-1 border-s border-border ps-4"}>
      {nodes.map((node) => (
        <li key={node.name}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="font-mono text-sm text-foreground">{node.name}</span>
            {node.note ? <span className="text-sm text-muted-foreground">{node.note}</span> : null}
          </div>
          {node.children?.length ? <Tree nodes={node.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}
