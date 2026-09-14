"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Command } from "../code";
import { FOCUS_RING } from "../styles";

type Step = { step: 1 | 2 | 3; title: string; body: string; command?: string };
type Line = { name: string; depth: number; step?: 1 | 2 | 3; note?: string };

/**
 * The steps beside the project they produce. The tree is always complete and readable, so
 * nothing depends on this component running. Pointing at, focusing or pressing a step lights
 * the files that step wrote and quiets the rest; pressing it again, or pointing away, lets
 * the tree go back to whole.
 */
function ProjectSteps({ steps, tree, prompts }: { steps: Step[]; tree: Line[]; prompts: string[] }) {
  const [pinned, setPinned] = useState<Step["step"] | null>(null);
  const [hovered, setHovered] = useState<Step["step"] | null>(null);
  const active = hovered ?? pinned;

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-4">
      <ol className="grid min-w-0 grid-cols-1 content-start gap-10 lg:pe-12">
        {steps.map((step) => {
          const lit = active === step.step;
          return (
            <li
              key={step.step}
              onPointerEnter={() => setHovered(step.step)}
              onPointerLeave={() => setHovered(null)}
              onFocusCapture={() => setHovered(step.step)}
              onBlurCapture={() => setHovered(null)}
              className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] gap-x-4"
            >
              <span
                aria-hidden
                className={cn(
                  "type-display text-4xl tabular-nums transition-colors duration-300 ease-fluid",
                  lit ? "text-primary" : "text-subtle-foreground",
                )}
              >
                {step.step}
              </span>
              <div className="grid min-w-0 grid-cols-1 content-start gap-3">
                <h3>
                  <button
                    type="button"
                    aria-pressed={pinned === step.step}
                    onClick={() => setPinned((current) => (current === step.step ? null : step.step))}
                    className={cn("rounded-sm text-start type-section text-xl text-foreground", FOCUS_RING)}
                  >
                    {step.title}
                  </button>
                </h3>
                <p className="text-pretty text-muted-foreground">{step.body}</p>
                {step.command ? <Command value={step.command} /> : null}
                {step.step === 2 ? (
                  <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                    {prompts.map((prompt) => (
                      <span key={prompt}>{prompt}</span>
                    ))}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <figure className="min-w-0 self-start overflow-hidden rounded-2xl bg-card shadow-border">
        <figcaption className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <span className="font-mono text-xs text-foreground">your-project/</span>
          <span className="text-xs text-subtle-foreground">after all three steps</span>
        </figcaption>
        <ul className="grid py-2 font-mono text-xs">
          {tree.map((line, index) => {
            const own = line.step !== undefined && line.step === active;
            const quiet = active !== null && !own;
            return (
              <li
                key={`${index}-${line.name}`}
                className={cn(
                  "grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 px-6 py-2 transition-[background-color,opacity,color] duration-300 ease-fluid",
                  own ? "bg-primary/10 text-foreground" : "text-muted-foreground",
                  quiet && "opacity-40",
                )}
              >
                <span className="text-subtle-foreground tabular-nums">{line.step ?? ""}</span>
                <span className="truncate" style={{ paddingInlineStart: `${line.depth * 1.25}rem` }}>
                  {line.name}
                </span>
                <span className="hidden truncate font-sans text-subtle-foreground sm:block">{line.note ?? ""}</span>
              </li>
            );
          })}
        </ul>
      </figure>
    </div>
  );
}

export { ProjectSteps };
