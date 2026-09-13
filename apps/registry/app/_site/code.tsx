import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";

/** A command to run, presented as the one line you paste. */
export function Command({ value, className }: { value: string; className?: string }) {
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
export function SourceBlock({ path, content }: { path: string; content: string }) {
  const file = path.split("/").pop() ?? path;
  const lines = content.split("\n").length;
  return (
    <figure className="overflow-hidden rounded-md border border-border bg-card">
      <figcaption className="flex items-center gap-2 border-b border-border ps-3 pe-1.5 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{file}</span>
        <span className="shrink-0 text-xs text-subtle-foreground">{lines} lines</span>
        <CopyButton value={content} label={file} />
      </figcaption>
      <pre className="scroll-slim max-h-[30rem] overflow-auto p-4 font-mono text-xs leading-relaxed text-card-foreground">
        <code>{content}</code>
      </pre>
    </figure>
  );
}

/** Labelled cells with hairline gaps — the facts about an item, not a meta string. */
export function DataPlate({ cells }: { cells: { label: string; value: string }[] }) {
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
