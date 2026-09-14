import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { CODE_FRAME } from "./code";
import { CopyButton } from "./copy-button";
import { FilePeek } from "./file-peek";
import { peekFile, treePeeks } from "./peek";
import { FOCUS_RING } from "./styles";
import { nodesFromLines, nodesFromNested, type NestedLike } from "./tree-nodes";
import { TreeView } from "./tree-view";

/*
 * The docs' building blocks. Every surface here is the site's code-surface frame from
 * code.tsx (so a card, a command, a code block and a file tree share their border, shadow,
 * radius and type), one muted ground for notes, space rather than rules between groups, and
 * every value from the spacing table and the type scale.
 */

/** Numbered steps. A thin line runs from each number to the next, and stops at the last. */
function Steps({ children }: { children: ReactNode }) {
  return <ol className="grid min-w-0 grid-cols-1">{children}</ol>;
}

function Step({
  number,
  title,
  last = false,
  children,
}: {
  number: number;
  title: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <li className={cn("relative grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-x-6", !last && "pb-12")}>
      {!last ? <span aria-hidden className="absolute start-4 top-10 bottom-2 w-px bg-border" /> : null}
      <span className="grid size-8 place-items-center rounded-full bg-muted font-mono text-xs font-semibold text-foreground tabular-nums">
        {number}
      </span>
      <div className="grid min-w-0 grid-cols-1 content-start gap-4 pt-1">
        <h3 className="type-section text-lg text-foreground">{title}</h3>
        {children}
      </div>
    </li>
  );
}

/** Body copy inside a step or section. */
function Prose({ children }: { children: ReactNode }) {
  return <p className="max-w-2xl text-pretty text-muted-foreground">{children}</p>;
}

type TreeLine = { name: string; depth: number; note?: string };

/**
 * What a command leaves behind, as an explorable tree: every folder open, every row keyboard
 * reachable, and every row with a real file behind it previewing that file.
 */
async function FileTree({ root, lines, label }: { root: string; lines: TreeLine[]; label: string }) {
  const nodes = nodesFromLines(lines);
  return <TreeView title={root} label={label} nodes={nodes} peeks={await treePeeks(root, nodes)} />;
}

/** A tree from an already nested shape, framed like every other code surface. */
async function NestedTree({ root, label, nodes }: { root: string; label: string; nodes: NestedLike[] }) {
  const tree = nodesFromNested(nodes);
  return <TreeView title={root} label={label} nodes={tree} peeks={await treePeeks(root, tree)} />;
}

/** A short aside that matters: something a step leaves undone, or a thing to know first. */
function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid max-w-2xl gap-1 rounded-lg bg-muted px-4 py-3 text-sm">
      <p className="font-semibold text-foreground">{title}</p>
      <div className="text-pretty text-muted-foreground">{children}</div>
    </div>
  );
}

const INLINE_CODE = "rounded-md bg-muted px-1 py-0.5 font-mono text-sm text-foreground";

/**
 * Inline code in running copy. `file` names the repo file the text stands for, as a tree
 * would draw it (`context/progress.md`, `your-project/context/ui-rules.md`); hovering or
 * focusing the name then previews it. A `file` with nothing behind it fails the build.
 */
async function Code({ children, file }: { children: ReactNode; file?: string }) {
  if (!file) return <code className={INLINE_CODE}>{children}</code>;
  return (
    <FilePeek
      peek={await peekFile(file)}
      render={
        <code
          className={cn(
            INLINE_CODE,
            "cursor-default underline decoration-subtle-foreground decoration-dotted underline-offset-4 transition-colors duration-300 ease-fluid",
            "hover:bg-primary/10 data-popup-open:bg-primary/10",
            FOCUS_RING,
          )}
        />
      }
    >
      {children}
    </FilePeek>
  );
}

/** Choices or destinations, each a whole clickable surface. */
function LinkCards({ items }: { items: { href: string; title: string; body: string; meta?: string }[] }) {
  return (
    <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.href} className="min-w-0">
          <Link
            href={item.href}
            className={cn(
              CODE_FRAME,
              "group grid h-full content-start gap-2 p-6 transition-shadow duration-300 ease-fluid hover:shadow-border-hover",
              FOCUS_RING,
            )}
          >
            <span className="flex items-center justify-between gap-4">
              <span className="type-section text-base text-card-foreground">{item.title}</span>
              <ArrowRightIcon
                aria-hidden
                className="size-4 text-subtle-foreground transition-transform duration-300 ease-fluid group-hover:translate-x-1 rtl:-scale-x-100"
              />
            </span>
            <span className="text-sm text-pretty text-muted-foreground">{item.body}</span>
            {item.meta ? <span className="pt-2 font-mono text-xs text-subtle-foreground">{item.meta}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A command and what it's for, as a compact list. */
function CommandList({ items }: { items: { command: string; note: string }[] }) {
  return (
    <dl className={cn(CODE_FRAME, "grid min-w-0 grid-cols-1 divide-y divide-border")}>
      {items.map((item) => (
        <div key={item.command} className="grid min-w-0 gap-x-6 ps-4 pe-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
          <dt className="flex min-w-0 items-center gap-2">
            <code className="min-w-0 flex-1 truncate py-2 font-mono text-xs leading-6 text-card-foreground">
              <span aria-hidden className="text-subtle-foreground select-none">
                ${" "}
              </span>
              {item.command}
            </code>
            <CopyButton value={item.command} label="command" className="sm:order-last" />
          </dt>
          <dd className="pe-3 pb-2 text-xs text-muted-foreground sm:py-2">{item.note}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Cards that inform rather than link: a title, an optional code label, and a line or two. */
function InfoCards({ items, columns = 2 }: { items: { title: string; code?: string; body: ReactNode }[]; columns?: 2 | 3 }) {
  return (
    <ul className={cn("grid min-w-0 grid-cols-1 gap-4", columns === 3 ? "md:grid-cols-3" : "sm:grid-cols-2")}>
      {items.map((item) => (
        <li key={item.title} className={cn(CODE_FRAME, "grid content-start gap-2 p-6")}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="type-section text-base text-card-foreground">{item.title}</h3>
            {item.code ? <code className="font-mono text-xs text-primary">{item.code}</code> : null}
          </div>
          <p className="text-sm text-pretty text-muted-foreground">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** A titled list inside one frame: rules, conventions, anything read top to bottom. */
function Rows({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <dl className={cn(CODE_FRAME, "grid grid-cols-1 divide-y divide-border")}>
      {items.map((item) => (
        <div key={item.title} className="grid gap-1 px-6 py-4">
          <dt className="text-sm font-semibold text-card-foreground">{item.title}</dt>
          <dd className="max-w-2xl text-sm text-pretty text-muted-foreground">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Two side by side: the version that fails a test, and the version that passes it. */
function Compare({ bad, good }: { bad: { label: string; text: string }; good: { label: string; text: string } }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      {[
        { ...bad, mark: "✕", tone: "text-destructive" },
        { ...good, mark: "✓", tone: "text-success" },
      ].map((side) => (
        <figure key={side.label} className={cn(CODE_FRAME, "grid content-start gap-2 p-6")}>
          <figcaption className={cn("flex items-center gap-2 text-xs font-semibold", side.tone)}>
            <span aria-hidden>{side.mark}</span>
            {side.label}
          </figcaption>
          <p className="text-sm text-card-foreground">{side.text}</p>
        </figure>
      ))}
    </div>
  );
}

/** Compact links to other items, for "installs alongside" and "used by". */
function Chips({ items }: { items: { href: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={cn(
              "inline-flex h-8 items-center rounded-md bg-card px-3 font-mono text-xs text-card-foreground shadow-border transition-shadow duration-300 ease-fluid hover:shadow-border-hover",
              FOCUS_RING,
            )}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { Chips, Code, CommandList, Compare, FileTree, InfoCards, LinkCards, NestedTree, Note, Prose, Rows, Step, Steps };
