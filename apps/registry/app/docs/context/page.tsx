import type { Metadata } from "next";
import Link from "next/link";

import { Code, Compare, Prose } from "../../_site/docs-ui";
import { CONTEXT_TREE, PROJECT_TREE } from "../../_site/kit";
import { DocPage, Section } from "../../_site/prose";
import { TEXT_LINK } from "../../_site/styles";
import type { TocEntry } from "../../_site/toc";
import { nodesFromLines, nodesFromNested } from "../../_site/tree-nodes";
import { TreeSwitch } from "../../_site/tree-switch";

export const metadata: Metadata = {
  title: "Context",
  description: "The architecture a project writes down before it writes any code.",
};

const TOC: TocEntry[] = [
  { id: "shape", label: "The shape" },
  { id: "why-folders", label: "A folder per feature" },
  { id: "criteria", label: "Writing criteria" },
];

/** A new project's `context/`: the slice of the landing page's project tree under that folder. */
const start = PROJECT_TREE.findIndex((line) => line.name === "context/");
const end = PROJECT_TREE.findIndex((line, index) => index > start && line.depth === 0);
const PROJECT_CONTEXT = PROJECT_TREE.slice(start + 1, end === -1 ? undefined : end).map((line) => ({
  ...line,
  depth: line.depth - 1,
}));

export default function ContextPage() {
  return (
    <DocPage
      title="Context"
      lead="A project's architecture, written down before there is code to describe. It is what an agent reads before it touches anything."
      toc={TOC}
    >
      <Section
        id="shape"
        title="The shape"
        lead="A few files at the top, then one folder per numbered feature. The number matches the branch and the build plan entry."
      >
        <TreeSwitch
          label="Whose context"
          options={[
            {
              value: "project",
              label: "A new project",
              title: "your-project/context/",
              nodes: nodesFromLines(PROJECT_CONTEXT),
            },
            {
              value: "groundwork",
              label: "Groundwork itself",
              title: "groundwork/",
              nodes: nodesFromNested(CONTEXT_TREE),
            },
          ]}
        />
        <Prose>
          A new project gets its house style from kit init and its <Code>project-overview.md</Code>,{" "}
          <Code>architecture.md</Code> and <Code>build-plan.md</Code> from the{" "}
          <Link href="/docs/kickoff" className={TEXT_LINK}>
            kickoff prompts
          </Link>
          . Groundwork&apos;s own folder is the one these docs are written from.
        </Prose>
      </Section>

      <Section
        id="why-folders"
        title="A folder per feature"
        lead="Work used to leave a plan in chat, decisions in a tracker, and evidence nowhere. The tracker reached 450 lines and stopped being read."
      >
        <Prose>
          One folder per feature gives every decision somewhere to live, so <Code>progress.md</Code> can go back to a
          status block and a checklist. When the feature merges, its folder merges with it.
        </Prose>
      </Section>

      <Section
        id="criteria"
        title="Writing criteria"
        lead="A spec's done when list is the part with teeth, so it is the part worth getting right. Write each one so someone who wasn't there could check it."
      >
        <Compare
          bad={{ label: "Can't be checked by anyone else", text: "Filtering works." }}
          good={{ label: "Can", text: "Selecting a status narrows the table and the count updates." }}
        />
      </Section>
    </DocPage>
  );
}
