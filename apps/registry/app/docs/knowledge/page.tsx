import type { Metadata } from "next";

import { DocPage, Section } from "../../_site/prose";
import type { TocEntry } from "../../_site/toc";

export const metadata: Metadata = {
  title: "Knowledge",
  description: "Gotchas harvested from projects that already paid for them.",
};

const TOC: TocEntry[] = [
  { id: "bar", label: "What earns a place" },
  { id: "format", label: "The format" },
  { id: "staleness", label: "Staleness" },
];

const FRONTMATTER = `---
scope: stack          # project | stack | universal
stack: [nextjs-16, tailwind-4, shadcn-4]
verified_version: shadcn 4.21.0
verified_on: 2026-09-13
---`;

export default function KnowledgePage() {
  return (
    <DocPage
      title="Knowledge"
      lead="Things that cost real time because a tool behaved differently than its documentation said. Written by /harvest, tagged by stack, and installed into a new project according to what that project is built on."
      toc={TOC}
    >
      <Section id="bar" title="What earns a place">
        <p className="max-w-prose text-muted-foreground">
          Not a documentation mirror. A note earns its place only when the docs are silent or wrong. Anything that
          restates the documentation makes the rest of the file less likely to be read, which costs more than it adds.
        </p>
        <p className="max-w-prose text-muted-foreground">
          The test is whether it cost someone an hour. A gotcha you solve and do not write down, you solve again in the
          next project — and the whole premise of a shared foundation is that the second project is cheaper than the
          first.
        </p>
      </Section>

      <Section
        id="format"
        title="The format"
        lead="Frontmatter says who the file is for and how stale it is. Then one bullet per gotcha."
      >
        <pre className="scroll-slim overflow-x-auto rounded-md border border-border bg-card p-4 font-mono text-xs text-card-foreground">
          <code>{FRONTMATTER}</code>
        </pre>
        <p className="max-w-prose text-muted-foreground">
          Each bullet opens with a bolded claim that states the trap, then the detail and the workaround. The bold half
          has to carry the finding on its own, because that is the part someone scanning twenty bullets actually reads.
        </p>
      </Section>

      <Section id="staleness" title="Staleness">
        <p className="max-w-prose text-muted-foreground">
          <span className="font-mono text-sm">verified_on</span> is what tells a reader whether to trust the file or
          re-check it. Update it whenever you confirm a bullet against the installed tool — and never write an API
          example from memory, since documentation drifting from reality is the exact problem these files exist to fix.
        </p>
      </Section>
    </DocPage>
  );
}
