import type { ReactNode } from "react";

import { Toc, type TocEntry } from "./toc";

/**
 * Every docs page is the same three things: a title, a lead, and a run of sections the
 * table of contents can observe. Sharing the shell is what keeps the TOC's ids and the
 * headings' ids from drifting apart — item pages included, which is why `eyebrow` and
 * `aside` exist rather than a second shell.
 *
 * The article column is `grid-cols-1` (a `minmax(0,1fr)` track), not an implicit one: an
 * implicit grid track sizes to its widest child, so a wide table preview inside it would
 * push the whole column past the viewport instead of scrolling in its own panel.
 */
function DocPage({
  title,
  lead,
  toc,
  eyebrow,
  aside,
  children,
}: {
  title: string;
  lead: ReactNode;
  toc: TocEntry[];
  eyebrow?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-12">
      <article className="grid min-w-0 grid-cols-1 content-start">
        {eyebrow ? <div className="mb-3 text-sm text-muted-foreground">{eyebrow}</div> : null}
        <h1 className="type-display text-4xl text-foreground">{title}</h1>
        <p className="mt-4 max-w-prose text-lg text-muted-foreground">{lead}</p>
        {aside ? <div className="mt-6">{aside}</div> : null}
        {children}
      </article>
      <Toc entries={toc} />
    </div>
  );
}

function Section({
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
    <section className="mt-10 grid min-w-0 grid-cols-1 gap-4 border-t border-border pt-10">
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

/**
 * Prose read out of the repo — a skill's description — keeps its markdown backticks. Those
 * are the strings a person types, so they get the mono face here as they would anywhere
 * else on the site.
 */
function RepoText({ children }: { children: string }) {
  return (
    <>
      {children.split(/(`[^`]+`)/).map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={index} className="font-mono">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

type TreeNodeLike = { name: string; note?: string; children?: TreeNodeLike[] };

/** A file tree, indented by nesting rather than by drawn rules. */
function Tree({ nodes, depth = 0 }: { nodes: TreeNodeLike[]; depth?: number }) {
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

export { DocPage, RepoText, Section, Tree };
