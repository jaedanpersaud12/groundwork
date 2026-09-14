import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";
import { FOCUS_RING } from "./styles";

/*
 * The docs' building blocks. One surface (`bg-card shadow-border`), one muted ground for
 * notes, space rather than rules between groups, and every value from the spacing table
 * and the type scale.
 */

const SURFACE = "rounded-xl bg-card text-card-foreground shadow-border";

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

/** A file's contents with its name and a copy button. */
function CodeBlock({ file, code }: { file: string; code: string }) {
  return (
    <figure className={cn(SURFACE, "grid min-w-0 grid-cols-1 overflow-hidden")}>
      <figcaption className="flex items-center gap-2 border-b border-border ps-4 pe-2 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{file}</span>
        <CopyButton value={code} label={file} />
      </figcaption>
      <pre className="p-4 font-mono text-xs leading-6 break-words whitespace-pre-wrap text-card-foreground">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

type TreeLine = { name: string; depth: number; note?: string };

/** What a command leaves behind, as the tree an editor would show. */
function FileTree({ root, lines }: { root: string; lines: TreeLine[] }) {
  return (
    <figure className={cn(SURFACE, "min-w-0 overflow-hidden")}>
      <figcaption className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">{root}</figcaption>
      <ul className="grid py-2 font-mono text-xs">
        {lines.map((line, index) => (
          <li key={`${index}-${line.name}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 px-4 py-1">
            <span className="truncate text-foreground" style={{ paddingInlineStart: `${line.depth * 1.25}rem` }}>
              {line.name}
            </span>
            <span className="hidden truncate font-sans text-muted-foreground sm:block">{line.note ?? ""}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** A short aside that matters: something a step leaves undone, or a thing to know first. */
function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid max-w-2xl gap-1 rounded-xl bg-muted px-5 py-4 text-sm">
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
              SURFACE,
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
    <dl className={cn(SURFACE, "grid min-w-0 grid-cols-1 divide-y divide-border")}>
      {items.map((item) => (
        <div key={item.command} className="grid min-w-0 gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-baseline sm:gap-6">
          <dt className="flex min-w-0 items-center gap-2">
            <code className="min-w-0 truncate font-mono text-xs text-card-foreground">{item.command}</code>
            <CopyButton value={item.command} label="command" />
          </dt>
          <dd className="text-sm text-muted-foreground">{item.note}</dd>
        </div>
      ))}
    </dl>
  );
}

export { Code, CodeBlock, CommandList, FileTree, LinkCards, Note, Prose, Step, Steps };
