import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { CODE_FRAME } from "./code";
import { CopyButton } from "./copy-button";
import { FOCUS_RING } from "./styles";
import { nodesFromLines } from "./tree-nodes";
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

/** What a command leaves behind, as an explorable tree: every folder open, every row keyboard reachable. */
function FileTree({ root, lines, label }: { root: string; lines: TreeLine[]; label: string }) {
  return <TreeView title={root} label={label} nodes={nodesFromLines(lines)} />;
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

/** Inline code in running copy. */
function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-md bg-muted px-1 py-0.5 font-mono text-sm text-foreground">{children}</code>;
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

export { Code, CommandList, FileTree, LinkCards, Note, Prose, Step, Steps };
