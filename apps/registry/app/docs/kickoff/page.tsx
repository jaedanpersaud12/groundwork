import type { Metadata } from "next";
import Link from "next/link";

import { SourceBlock } from "../../_site/code-block";
import { Code, NestedTree, Note, Prose, Step, Steps } from "../../_site/docs-ui";
import { KICKOFF, PROMPT_FILES, TEMPLATE_TREE } from "../../_site/kit";
import { DocPage, Section } from "../../_site/prose";
import { TEXT_LINK } from "../../_site/styles";
import type { TocEntry } from "../../_site/toc";

export const metadata: Metadata = {
  title: "Kickoff",
  description: "The three prompts that take a new project from an idea to a context/ folder as specific as a real one.",
};

const TOC: TocEntry[] = [
  { id: "prompts", label: "The three prompts" },
  { id: "template", label: "What kit init copies" },
];

/** A prompt's own heading ("Stage 2 — Architecture") as a step title, in sentence case: "Architecture". */
function stepTitle(heading: string): string {
  const name = heading.split(/\s+\u2014\s+/).pop() ?? heading;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export default function KickoffPage() {
  return (
    <DocPage
      title="Kickoff"
      lead="Three plain markdown prompts, pasted into any LLM chat in order. Each answer is saved to a file and becomes the next prompt's input, for the same reason a feature's plan lives in plan.md."
      toc={TOC}
    >
      <Section
        id="prompts"
        title="The three prompts"
        lead="Copy the first one. Save what it produces into context/, then paste that into the second."
      >
        <Steps>
          {PROMPT_FILES.map((prompt, index) => {
            const entry = KICKOFF.find((item) => item.prompt === prompt.file);
            return (
              <Step
                key={prompt.file}
                number={index + 1}
                title={stepTitle(prompt.title)}
                last={index === PROMPT_FILES.length - 1}
              >
                {entry ? (
                  <Prose>
                    Writes <Code>{entry.output}</Code>: {entry.holds}.
                  </Prose>
                ) : null}
                <SourceBlock path={prompt.file} content={prompt.content} />
              </Step>
            );
          })}
        </Steps>
      </Section>

      <Section
        id="template"
        title="What kit init copies"
        lead="The prompts write what is specific to a project. The rest of context/ is house style, copied once from a preset by kit init."
      >
        <NestedTree
          root={TEMPLATE_TREE[0]?.name ?? "templates/"}
          label="The files kit init copies into context/"
          nodes={TEMPLATE_TREE[0]?.children ?? []}
        />
        <Note title="Why the prompts stay manual">
          They work for anyone, in any LLM chat, with nothing installed.{" "}
          <Link href="/docs#whole-kit" className={TEXT_LINK}>
            See where they sit in setup
          </Link>
          .
        </Note>
      </Section>
    </DocPage>
  );
}
