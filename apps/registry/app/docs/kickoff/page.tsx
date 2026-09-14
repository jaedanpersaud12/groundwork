import type { Metadata } from "next";
import Link from "next/link";

import { SourceBlock } from "../../_site/code-block";
import { PROMPT_FILES, PROMPT_NOTES, TEMPLATE_TREE } from "../../_site/kit";
import { DocPage, Section, Tree } from "../../_site/prose";
import { TEXT_LINK } from "../../_site/styles";
import type { TocEntry } from "../../_site/toc";

export const metadata: Metadata = {
  title: "Kickoff",
  description: "The three prompts that take a new project from an idea to a context/ folder as specific as a real one.",
};

const TOC: TocEntry[] = [
  { id: "prompts", label: "The three prompts" },
  { id: "template", label: "What gets copied" },
  { id: "next", label: "Where kit init comes in" },
];

export default function KickoffPage() {
  return (
    <DocPage
      title="Kickoff"
      lead="Three plain-markdown prompts, pasted into any LLM chat in order — no tool access assumed, no Claude Code required. Each one's output is the next one's input, saved to a file and pasted in, the same reason a feature's plan lives in plan.md instead of the conversation that produced it."
      toc={TOC}
    >
      <Section
        id="prompts"
        title="The three prompts"
        lead="Copy the first one now. Save what it produces, and paste that into the next."
      >
        <div className="grid gap-8">
          {PROMPT_FILES.map((prompt) => (
            <div key={prompt.file} className="grid gap-2">
              <div className="grid gap-1">
                <h3 className="type-section text-base text-foreground">{prompt.title}</h3>
                <p className="text-sm text-muted-foreground">{PROMPT_NOTES[prompt.file]}</p>
              </div>
              <SourceBlock path={prompt.file} content={prompt.content} />
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="template"
        title="What gets copied"
        lead="The three prompts generate project-overview.md, architecture.md and build-plan.md. The rest of a project's context/ folder is house style, not project fact — copied once from a preset rather than written by a model. next16-insforge is the first preset, lifted from a real project and stripped of everything specific to it."
      >
        <div className="rounded-md border border-border bg-card p-5">
          <Tree nodes={TEMPLATE_TREE} />
        </div>
      </Section>

      <Section id="next" title="Where kit init comes in">
        <p className="max-w-2xl text-pretty text-muted-foreground">
          <code className="font-mono">kit init</code> copies this template into <code className="font-mono">context/</code>,
          installs the lifecycle skills and sets up the design system, so the only manual part left is these three
          prompts. They stay manual on purpose: they work in any LLM chat, with nothing installed.{" "}
          <Link href="/docs#whole-kit" className={TEXT_LINK}>
            See the setup steps
          </Link>
          .
        </p>
      </Section>
    </DocPage>
  );
}
