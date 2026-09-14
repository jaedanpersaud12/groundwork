"use client";

import { cn } from "@/lib/utils";

import { dateExamples } from "./dates";
import { pillExamples } from "./pills";
import { primitiveExamples } from "./primitives";
import { tableExamples } from "./table";
import type { ExampleEntry, ExampleSet } from "./types";

/**
 * Concatenates rather than spreading: a name that appears in two files — a chip shown
 * on its own in one and inside a band in another — should gain an example, not lose
 * whichever file the spread happened to read first.
 */
function merge(sets: ExampleSet[]): ExampleSet {
  const all: ExampleSet = {};
  for (const set of sets) {
    for (const [name, entries] of Object.entries(set)) {
      all[name] = [...(all[name] ?? []), ...entries];
    }
  }
  return all;
}

const ALL = merge([primitiveExamples, tableExamples, pillExamples, dateExamples]);

function Render({ entry }: { entry: ExampleEntry }) {
  return <>{entry.render()}</>;
}

/** Every example for a registry item, or a note when it has no visual preview. */
export function Examples({ name, fallback }: { name: string; fallback: string }) {
  const entries = ALL[name];
  if (!entries?.length) {
    return (
      <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">{fallback}</div>
    );
  }
  return (
    // `grid-cols-1` and `min-w-0` both, or a wide preview's content width becomes the grid
    // track's width and the page scrolls sideways instead of the panel.
    <div className="grid grid-cols-1 gap-4">
      {entries.map((entry) => (
        <figure key={entry.title} className="grid min-w-0 grid-cols-1 gap-2">
          {entries.length > 1 || entry.description ? (
            <figcaption className="grid gap-0.5">
              <span className="text-sm font-medium text-foreground">{entry.title}</span>
              {entry.description ? <span className="text-xs text-muted-foreground">{entry.description}</span> : null}
            </figcaption>
          ) : null}
          {/*
           * Every panel scrolls sideways, not only the wide ones: a pagination bar is narrow
           * at 1440px and wider than a 400px phone. `justify-center-safe`, not
           * `justify-center`, because a centred child that overflows is cut off on the left
           * where no scrollbar can reach it; the safe form falls back to the start edge.
           */}
          <div
            className={cn(
              "flex min-h-32 min-w-0 overflow-x-auto rounded-lg bg-card shadow-border",
              entry.wide ? "items-start p-4" : "items-center justify-center-safe p-6",
            )}
          >
            <Render entry={entry} />
          </div>
        </figure>
      ))}
    </div>
  );
}
