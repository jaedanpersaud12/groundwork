import { Fragment } from "react";

import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";

/*
 * The one spec for every code surface on the site: commands, code blocks, source files,
 * file trees. A raised surface from the contract, a 12px container (`rounded-lg`) whose inner
 * rows are 8px (`rounded-md`) with 4px between them, a 40px header, 12px mono text on a 24px
 * line, and the copy button at the trailing end of the first row. Change it here and every
 * code surface moves together.
 */
const CODE_FRAME = "min-w-0 overflow-hidden rounded-lg bg-card text-card-foreground shadow-border";
const CODE_HEAD = "flex h-10 items-center gap-2 border-b border-border ps-4 pe-1";
const CODE_TITLE = "min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground";
const CODE_META = "shrink-0 font-mono text-xs text-subtle-foreground tabular-nums";
const CODE_TEXT = "font-mono text-xs leading-6";

/**
 * A command to run: one row, a `$` prompt the copy leaves out, and the copy button. `wrap`
 * lets a long command break between its words, never inside a flag, for pages where every
 * flag has to be visible; otherwise it stays on one line and scrolls.
 */
function Command({
  value,
  className,
  wrap = false,
  prompt = true,
}: {
  value: string;
  className?: string;
  wrap?: boolean;
  prompt?: boolean;
}) {
  return (
    <div className={cn(CODE_FRAME, "flex items-start gap-2 ps-4 pe-1", className)}>
      <code
        className={cn(
          "min-w-0 flex-1 py-2",
          CODE_TEXT,
          wrap ? "whitespace-normal" : "scroll-slim overflow-x-auto whitespace-nowrap",
        )}
      >
        {prompt ? (
          <span aria-hidden className="text-subtle-foreground select-none">
            ${" "}
          </span>
        ) : null}
        {wrap
          ? value.split(" ").map((part, index) => (
              <Fragment key={index}>
                <span className="inline-block max-w-full break-all">{part}</span>{" "}
              </Fragment>
            ))
          : value}
      </code>
      <CopyButton value={value} label="command" className="mt-1" />
    </div>
  );
}

/** Labelled cells with hairline gaps: the facts about an item, not a meta string. */
function DataPlate({ cells }: { cells: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border shadow-border sm:grid-cols-4">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-card px-4 py-3">
          <dt className="text-xs text-subtle-foreground">{cell.label}</dt>
          <dd className="mt-1 text-sm text-card-foreground">{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export { CODE_FRAME, CODE_HEAD, CODE_META, CODE_TEXT, CODE_TITLE, Command, DataPlate };
