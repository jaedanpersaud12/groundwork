"use client";

import { useCallback, useId, useRef, useState, type ComponentProps } from "react";
import { PreviewCard } from "@base-ui/react/preview-card";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import { CLOSE_DELAY, createPeekHandle, OPEN_DELAY, PeekGroup, type Peek } from "./file-peek";
import type { TreeNode } from "./tree-nodes";

/*
 * Adapted from interior.dev's Tree View (https://www.interior.dev/docs/tree-view): its
 * keyboard model, its spring caret and its open/close height animation are kept as they
 * are. What changed: every colour is a contract token instead of a stone palette or hex
 * value, the frame and rows follow the site's code-surface spec (see code.tsx), rows can
 * carry an accent (`tone`) so a page can mark the files it is talking about, the
 * container can take a header, and a row with a real file behind it opens that file's
 * opening lines on hover or focus (`peeks`, built on the server by peek.ts).
 */

const EASE = [0.23, 1, 0.32, 1] as const;
const LEAVE = [0.4, 0, 1, 1] as const;
const SMALL = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;
const OPEN_H = { duration: 0.28, ease: EASE } as const;
const OPEN_O = { duration: 0.18, ease: EASE } as const;
const SHUT_H = { duration: 0.2, ease: LEAVE } as const;
const SHUT_O = { duration: 0.14, ease: LEAVE } as const;
const STILL = { duration: 0 } as const;



type TreeRow = {
  node: TreeNode;
  level: number;
  parentId: string | null;
  branch: boolean;
  open: boolean;
};

function flatten(nodes: TreeNode[], openSet: ReadonlySet<string>, level = 1, parentId: string | null = null, out: TreeRow[] = []) {
  for (const node of nodes) {
    const branch = (node.children?.length ?? 0) > 0;
    const open = branch && openSet.has(node.id);
    out.push({ node, level, parentId, branch, open });
    if (open) flatten(node.children ?? [], openSet, level + 1, node.id, out);
  }
  return out;
}

/** Every branch id, for a tree that should start fully open. */
function allBranchIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((node) => (node.children?.length ? [node.id, ...allBranchIds(node.children)] : []));
}

function useTreeView({ nodes, defaultExpanded }: { nodes: TreeNode[]; defaultExpanded: string[] }) {
  const [openList, setOpenList] = useState<string[]>(defaultExpanded);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const openSet = new Set(openList);
  const rows = flatten(nodes, openSet);
  const tabStop =
    focusId !== null && rows.some((row) => row.node.id === focusId) ? focusId : (rows[0]?.node.id ?? null);

  const refs = useRef(new Map<string, HTMLElement>());
  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) refs.current.set(id, el);
    else refs.current.delete(id);
  }, []);
  const focusRow = useCallback((id: string) => {
    setFocusId(id);
    refs.current.get(id)?.focus();
  }, []);
  const toggle = useCallback(
    (id: string) => setOpenList((list) => (list.includes(id) ? list.filter((value) => value !== id) : [...list, id])),
    [],
  );

  const handleKey = (event: React.KeyboardEvent, row: TreeRow) => {
    const at = rows.findIndex((r) => r.node.id === row.node.id);
    const go = (index: number) => {
      const target = rows[index];
      if (target) focusRow(target.node.id);
    };
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        return go(at + 1);
      case "ArrowUp":
        event.preventDefault();
        return go(at - 1);
      case "ArrowRight":
        event.preventDefault();
        if (row.branch && !row.open) toggle(row.node.id);
        else if (row.open) go(at + 1);
        return;
      case "ArrowLeft":
        event.preventDefault();
        if (row.open) toggle(row.node.id);
        else if (row.parentId) focusRow(row.parentId);
        return;
      case "Home":
        event.preventDefault();
        return go(0);
      case "End":
        event.preventDefault();
        return go(rows.length - 1);
      case "Enter":
      case " ":
        event.preventDefault();
        setSelectedId(row.node.id);
        if (row.branch) toggle(row.node.id);
        return;
      default:
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      const letter = event.key.toLowerCase();
      for (let step = 1; step <= rows.length; step++) {
        const candidate = rows[(at + step) % rows.length];
        if (candidate.node.label.toLowerCase().startsWith(letter)) {
          event.preventDefault();
          focusRow(candidate.node.id);
          return;
        }
      }
    }
  };

  return { rows, selectedId, setSelectedId, tabStop, register, focusRow, setFocusId, toggle, handleKey };
}

function Caret({ open }: { open: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      initial={false}
      animate={{ rotate: open ? 90 : 0 }}
      transition={reduced ? STILL : SMALL}
      className="flex size-4 shrink-0 items-center justify-center text-subtle-foreground rtl:-scale-x-100"
    >
      <svg viewBox="0 0 12 12" width="10" height="10" focusable="false">
        <path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.span>
  );
}

function TreeView({
  nodes,
  label,
  title,
  defaultExpanded,
  peeks,
  className,
}: {
  nodes: TreeNode[];
  label: string;
  /** Shown in a header row, the way a code block shows its file name. */
  title?: string;
  /** Branch ids open at first. Omit to start with every branch open. */
  defaultExpanded?: string[];
  /** File previews keyed by row id, from `treePeeks`. A row without one opens nothing. */
  peeks?: Record<string, Peek>;
  className?: string;
}) {
  const tree = useTreeView({ nodes, defaultExpanded: defaultExpanded ?? allBranchIds(nodes) });
  const reduced = useReducedMotion();
  const hintId = useId();
  const [peekHandle] = useState(createPeekHandle);
  const labels = useRef(new Map<string, HTMLElement>());

  const renderNodes = (list: TreeNode[], level: number) =>
    list.map((node, index) => {
      const row = tree.rows.find((r) => r.node.id === node.id);
      if (!row) return null;
      const selected = tree.selectedId === node.id;
      const tone = node.tone ?? "default";
      const peek = peeks?.[node.id];

      const rowProps = {
        role: "treeitem",
        ref: (el: HTMLElement | null) => tree.register(node.id, el),
        "aria-level": level,
        "aria-posinset": index + 1,
        "aria-setsize": list.length,
        "aria-expanded": row.branch ? row.open : undefined,
        "aria-selected": selected,
        "aria-describedby": hintId,
        tabIndex: tree.tabStop === node.id ? 0 : -1,
        onFocus: () => tree.setFocusId(node.id),
        onKeyDown: (event: React.KeyboardEvent) => tree.handleKey(event, row),
        onClick: () => {
          tree.setSelectedId(node.id);
          tree.focusRow(node.id);
          if (row.branch) tree.toggle(node.id);
        },
        className: cn(
          "flex h-7 cursor-default items-center gap-1 rounded-md px-2 outline-none select-none",
          "transition-[background-color,color,opacity] duration-300 ease-fluid",
          "focus-visible:bg-primary/10 focus-visible:shadow-[inset_0_0_0_1px_var(--ring)]",
          selected
            ? "bg-muted text-foreground"
            : tone === "lit"
              ? "bg-primary/10 text-foreground"
              : "text-card-foreground hover:bg-muted data-popup-open:bg-muted",
          tone === "quiet" && !selected && "opacity-40",
        ),
      } satisfies ComponentProps<"div">;

      const content = (
        <>
          {row.branch ? <Caret open={row.open} /> : <span className="size-4 shrink-0" />}
          <span
            ref={(el) => {
              if (el) labels.current.set(node.id, el);
              else labels.current.delete(node.id);
            }}
            className={cn(
              "shrink-0 truncate font-mono text-xs",
              selected && "font-medium",
              // The same dotted underline inline code wears when it previews a file.
              peek && "leading-5 underline decoration-subtle-foreground decoration-dotted underline-offset-3",
            )}
          >
            {node.label}
          </span>
          {node.meta ? (
            <span className="hidden min-w-0 flex-1 truncate ps-4 text-end text-xs text-subtle-foreground sm:block">{node.meta}</span>
          ) : null}
        </>
      );

      return (
        <li key={node.id} role="none">
          {peek ? (
            <PreviewCard.Trigger
              {...rowProps}
              handle={peekHandle}
              payload={{ ...peek, id: node.id }}
              delay={OPEN_DELAY}
              closeDelay={CLOSE_DELAY}
              render={<div />}
            >
              {content}
            </PreviewCard.Trigger>
          ) : (
            <div {...rowProps}>{content}</div>
          )}

          {row.branch ? (
            <AnimatePresence initial={false}>
              {row.open ? (
                <motion.ul
                  key="group"
                  role="group"
                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={
                    reduced
                      ? { opacity: 0, transition: STILL }
                      : { height: 0, opacity: 0, transition: { height: SHUT_H, opacity: SHUT_O } }
                  }
                  transition={reduced ? STILL : { height: OPEN_H, opacity: OPEN_O }}
                  className="overflow-hidden"
                >
                  <div className="ms-4 border-s border-border ps-2">{renderNodes(node.children ?? [], level + 1)}</div>
                </motion.ul>
              ) : null}
            </AnimatePresence>
          ) : null}
        </li>
      );
    });

  return (
    <div className={cn("min-w-0 overflow-hidden rounded-lg bg-card text-card-foreground shadow-border", className)}>
      {title ? (
        <div className="flex h-10 items-center border-b border-border ps-4 pe-1">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{title}</span>
        </div>
      ) : null}
      <ul role="tree" aria-label={label} className="p-1">
        {renderNodes(nodes, 1)}
      </ul>
      {peeks ? <PeekGroup handle={peekHandle} anchorFor={(id) => labels.current.get(id) ?? null} /> : null}
      <span id={hintId} className="sr-only">
        Use the arrow keys to move. Right expands a folder, left collapses it or climbs to its parent. Home and End jump
        to the ends, and typing a letter jumps to the next name starting with it.
      </span>
    </div>
  );
}


export { TreeView };
