import type { Metadata } from "next";
import Link from "next/link";

import { CONTEXT_TREE } from "../../_site/kit";
import { DocPage, Section, Tree } from "../../_site/prose";
import { TEXT_LINK } from "../../_site/styles";
import type { TocEntry } from "../../_site/toc";

export const metadata: Metadata = {
  title: "Context",
  description: "The architecture a project writes down before it writes any code.",
};

const TOC: TocEntry[] = [
  { id: "shape", label: "The shape" },
  { id: "why-folders", label: "Why a folder per feature" },
  { id: "criteria", label: "Writing criteria" },
];

export default function ContextPage() {
  return (
    <DocPage
      title="Context"
      lead="A project's architecture, written down before there is any code to describe. This is what a new repo starts with instead of a blank CLAUDE.md, and it is what an agent reads before it touches anything."
      toc={TOC}
    >
      <Section
        id="shape"
        title="The shape"
        lead="Four files at the top, then one folder per numbered feature. The number matches the branch and the line in the build plan, so a branch, a folder and a plan entry are never three different things."
      >
        <div className="rounded-md border border-border bg-card p-5">
          <Tree nodes={CONTEXT_TREE} />
        </div>
        <p className="max-w-prose text-sm text-muted-foreground">
          This is groundwork&apos;s own <code className="font-mono">context/</code> — the folder this page
          describes is the one you&apos;re reading it from. A project bootstrapped by kickoff gets a related but
          different shape (<code className="font-mono">project-overview.md</code>,{" "}
          <code className="font-mono">architecture.md</code>, and a <code className="font-mono">build-plan.md</code>{" "}
          the same three prompts wrote) — see{" "}
          <Link href="/docs/kickoff" className={TEXT_LINK}>
            kickoff
          </Link>{" "}
          for that tree.
        </p>
      </Section>

      <Section id="why-folders" title="Why a folder per feature">
        <p className="max-w-prose text-muted-foreground">
          Work used to leave traces in three places: a plan in the chat, decisions in a growing tracker, and evidence
          nowhere at all. The tracker reached 450 lines and stopped being read — which is the same as not having one.
        </p>
        <p className="max-w-prose text-muted-foreground">
          One folder per feature fixes the location problem. The tracker goes back to being a status block and a
          checklist, because the detail finally has somewhere better to live. When the feature merges, its folder merges
          with it and stops being anyone&apos;s problem.
        </p>
      </Section>

      <Section
        id="criteria"
        title="Writing criteria"
        lead="A spec's “done when” list is the only part that has teeth, so it is the part worth getting right."
      >
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
          <div className="grid content-start gap-1 bg-card p-4">
            <p className="text-sm text-subtle-foreground">Can&apos;t be checked by anyone else</p>
            <p className="text-sm text-muted-foreground">Filtering works.</p>
          </div>
          <div className="grid content-start gap-1 bg-card p-4">
            <p className="text-sm text-subtle-foreground">Can</p>
            <p className="text-sm text-card-foreground">
              Selecting a status narrows the table and the count updates.
            </p>
          </div>
        </div>
        <p className="max-w-prose text-sm text-muted-foreground">
          The test is whether someone who was not in the room could sit down, read the criterion, and tell you whether
          it is true. If they would have to ask you what you meant, it is not a criterion yet.
        </p>
      </Section>
    </DocPage>
  );
}
