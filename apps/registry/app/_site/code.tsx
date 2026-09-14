import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";

/** A command to run, presented as the one line you paste. */
function Command({ value, className }: { value: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-card ps-3 pe-1.5 py-1.5",
        className,
      )}
    >
      <code className="scroll-slim min-w-0 flex-1 overflow-x-auto py-1 font-mono text-xs whitespace-nowrap text-card-foreground">
        {value}
      </code>
      <CopyButton value={value} label="command" />
    </div>
  );
}

/**
 * Source is shown, not paraphrased. Long files scroll inside the block rather than
 * pushing the rest of the page down — `scroll-slim` comes from the tokens package, so
 * the scrollbar belongs to the panel instead of the platform.
 */
function SourceBlock({
  path,
  content,
  label,
  wrap = false,
}: {
  path: string;
  content: string;
  label?: string;
  /** Soft-wrap long lines instead of scrolling them. For prose-y sources like frontmatter. */
  wrap?: boolean;
}) {
  const file = label ?? path.split("/").pop() ?? path;
  const lines = content.split("\n").length;
  return (
    <figure className="overflow-hidden rounded-md border border-border bg-card">
      <figcaption className="flex items-center gap-2 border-b border-border ps-3 pe-1.5 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{file}</span>
        <span className="shrink-0 text-xs text-subtle-foreground">{lines} lines</span>
        <CopyButton value={content} label={file} />
      </figcaption>
      <pre
        className={cn(
          "scroll-slim max-h-[30rem] overflow-auto p-4 font-mono text-xs leading-relaxed text-card-foreground",
          wrap && "whitespace-pre-wrap",
        )}
      >
        <code>{content}</code>
      </pre>
    </figure>
  );
}

/**
 * One real `no-raw-colors` failure: the line as it is written, the line as it should be,
 * and the rule's own message underneath. The message is passed in from the plugin's rule
 * metadata rather than quoted, so rewording the rule rewords the page.
 */
function LintFailure({
  path,
  violation,
  fix,
  message,
}: {
  path: string;
  violation: string;
  fix: string;
  message: string;
}) {
  return (
    <figure className="overflow-hidden rounded-md border border-border bg-card">
      <figcaption className="flex items-center gap-2 border-b border-border ps-3 pe-1.5 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{path}</span>
        <CopyButton value={fix} label={`the fixed line from ${path}`} />
      </figcaption>
      <pre className="scroll-slim overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        <code>
          {/*
            * The -/+ glyphs are decorative, so each line also carries its verdict as
            * sr-only text. Without it the only thing separating the wrong line from the
            * right one is colour, which assistive tech does not expose — and the message
            * below never says which line it is about.
            */}
          <span className="block text-destructive">
            <span className="sr-only">Fails: </span>
            <span aria-hidden="true">- </span>
            {violation}
          </span>
          <span className="block text-success">
            <span className="sr-only">Passes: </span>
            <span aria-hidden="true">+ </span>
            {fix}
          </span>
        </code>
      </pre>
      <p className="border-t border-border bg-destructive-subtle px-3 py-2 font-mono text-xs text-destructive">
        {message}
      </p>
    </figure>
  );
}

/** Labelled cells with hairline gaps — the facts about an item, not a meta string. */
function DataPlate({ cells }: { cells: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-card px-4 py-3">
          <dt className="text-xs text-subtle-foreground">{cell.label}</dt>
          <dd className="mt-1 text-sm text-card-foreground">{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export { Command, DataPlate, LintFailure, SourceBlock };
