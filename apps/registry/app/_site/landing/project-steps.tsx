"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Command } from "../code";
import { FOCUS_RING } from "../styles";
import { nodesFromLines } from "../tree-nodes";
import { TreeView } from "../tree-view";

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

      <TreeView
        title="your-project/"
        label="The project after all three steps"
        className="self-start"
        nodes={nodesFromLines(
          tree.map((line) => ({
            name: line.name,
            depth: line.depth,
            note: line.note,
            tone: active === null ? "default" : line.step === active ? "lit" : "quiet",
          })),
        )}
      />
    </div>
  );
}

export { ProjectSteps };
