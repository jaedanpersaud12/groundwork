"use client";

import type { ReactElement, ReactNode } from "react";
import { PreviewCard } from "@base-ui/react/preview-card";
import { FileCodeIcon, FileTextIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { CODE_HEAD, CODE_META, CODE_TEXT } from "./code";

/*
 * The hover card a file name opens: the file's path and length in the code-surface header,
 * then its opening lines, highlighted, fading out where the card stops. It is the site's
 * code surface lifted onto the popover ground, so it reads as the file itself rather than
 * a tooltip about it. Content comes from peek.ts, highlighted on the server.
 */

type Peek = {
  /** The repo path read, shown as the card's title. */
  path: string;
  lines: number;
  truncated: boolean;
  /** Markdown goes without line numbers, the way SourceBlock shows it. */
  prose: boolean;
  html: string;
};

/** Long enough that sweeping across a list doesn't flash cards; short enough to feel like a response. */
const OPEN_DELAY = 200;
const CLOSE_DELAY = 120;

function PeekCard({ peek }: { peek: Peek }) {
  const slash = peek.path.lastIndexOf("/") + 1;
  const Icon = peek.prose ? FileTextIcon : FileCodeIcon;
  return (
    <>
      <div className={cn(CODE_HEAD, "pe-4")}>
        <Icon aria-hidden className="size-3.5 shrink-0 text-subtle-foreground" />
        <span className="flex min-w-0 flex-1 font-mono text-xs">
          <span className="truncate text-subtle-foreground">{peek.path.slice(0, slash)}</span>
          <span className="shrink-0 text-popover-foreground">{peek.path.slice(slash)}</span>
        </span>
        <span className={CODE_META}>{peek.lines === 1 ? "1 line" : `${peek.lines} lines`}</span>
      </div>
      <pre
        data-line-numbers={peek.prose ? undefined : ""}
        className={cn(
          // Never wrapped: the source's own line breaks are the shape worth recognising, so a
          // long line runs off the edge and fades there, the way an editor pane clips it.
          "syntax max-h-78 overflow-hidden px-4 py-3 whitespace-pre mask-r-from-85%",
          CODE_TEXT,
          peek.truncated && "mask-b-from-60%",
        )}
      >
        <code dangerouslySetInnerHTML={{ __html: peek.html }} />
      </pre>
    </>
  );
}

const POPUP = cn(
  "w-120 max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-popover outline-none",
  "transition-[opacity,scale] duration-200 ease-fluid",
  "data-starting-style:scale-97 data-starting-style:opacity-0 data-ending-style:scale-97 data-ending-style:opacity-0 data-ending-style:duration-100",
);

type Placement = Pick<PreviewCard.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "anchor">;

function PeekPopup({ peek, ...placement }: { peek: Peek } & Placement) {
  return (
    <PreviewCard.Portal>
      <PreviewCard.Positioner
        collisionPadding={16}
        collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "end" }}
        className="isolate z-50"
        {...placement}
      >
        <PreviewCard.Popup className={POPUP}>
          <PeekCard peek={peek} />
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  );
}

/**
 * One file name in running copy. `render` is the element the name already is (inline code,
 * a table cell's text); it becomes focusable, so the card opens for keyboard readers too.
 */
function FilePeek({ peek, render, children }: { peek: Peek; render: ReactElement; children: ReactNode }) {
  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger delay={OPEN_DELAY} closeDelay={CLOSE_DELAY} tabIndex={0} render={render}>
        {children}
      </PreviewCard.Trigger>
      <PeekPopup peek={peek} side="bottom" align="start" sideOffset={8} />
    </PreviewCard.Root>
  );
}

type PeekHandle = ReturnType<typeof PreviewCard.createHandle<Peek & { id: string }>>;

function createPeekHandle(): PeekHandle {
  return PreviewCard.createHandle<Peek & { id: string }>();
}

/**
 * One card shared by many names — every row of a tree — so moving between rows swaps what
 * the open card shows instead of closing one and opening the next. `anchorFor` places it
 * beside the name under the pointer rather than beside the whole row.
 */
function PeekGroup({ handle, anchorFor }: { handle: PeekHandle; anchorFor: (id: string) => Element | null }) {
  return (
    <PreviewCard.Root handle={handle}>
      {({ payload }) =>
        payload ? (
          <PeekPopup
            peek={payload}
            side="inline-end"
            align="start"
            sideOffset={16}
            alignOffset={-12}
            anchor={() => anchorFor(payload.id)}
          />
        ) : null
      }
    </PreviewCard.Root>
  );
}

export { CLOSE_DELAY, createPeekHandle, FilePeek, OPEN_DELAY, PeekGroup, type Peek, type PeekHandle };
