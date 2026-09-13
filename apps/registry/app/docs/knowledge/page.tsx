import type { Metadata } from "next";

import { DocPage, Section } from "../../_site/prose";
import { knowledgeFiles } from "../../_site/repo";
import type { TocEntry } from "../../_site/toc";

export const metadata: Metadata = {
  title: "Knowledge",
  description: "Gotchas harvested from projects that already paid for them.",
};

const TOC: TocEntry[] = [
  { id: "bar", label: "What earns a place" },
  { id: "files", label: "What's in it" },
  { id: "format", label: "The format" },
  { id: "staleness", label: "Staleness" },
];

/** Read at build time, so a harvested file appears on the next deploy with no page edit. */
const FILES = knowledgeFiles();

export default function KnowledgePage() {
  const specimen = FILES[0];
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
        id="files"
        title="What's in it"
        lead={`${FILES.length} ${FILES.length === 1 ? "file" : "files"} in knowledge/ today, listed from the repo rather than from memory.`}
      >
        <div className="scroll-slim overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[34rem] text-start text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 text-start font-normal">
                  File
                </th>
                <th scope="col" className="px-4 py-2 text-start font-normal">
                  Scope
                </th>
                <th scope="col" className="px-4 py-2 text-start font-normal">
                  Stack
                </th>
                <th scope="col" className="px-4 py-2 text-end font-normal">
                  Gotchas
                </th>
                <th scope="col" className="px-4 py-2 text-start font-normal">
                  Verified
                </th>
              </tr>
            </thead>
            <tbody className="bg-card text-card-foreground">
              {FILES.map((file) => (
                <tr key={file.file} className="border-t border-border">
                  <td className="px-4 py-3">
                    <span className="block font-mono text-xs">{file.file}</span>
                    <span className="block text-xs text-muted-foreground">{file.title}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{file.scope}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{file.stack.join(", ")}</td>
                  <td className="px-4 py-3 text-end tabular-nums text-muted-foreground">{file.gotchas}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {file.verifiedVersion}, {file.verifiedOn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        id="format"
        title="The format"
        lead={
          specimen
            ? `Frontmatter says who the file is for and how stale it is. This is ${specimen.file}'s, as committed.`
            : "Frontmatter says who the file is for and how stale it is. Then one bullet per gotcha."
        }
      >
        {specimen ? (
          <pre className="scroll-slim overflow-x-auto rounded-md border border-border bg-card p-4 font-mono text-xs text-card-foreground">
            <code>{specimen.frontmatter}</code>
          </pre>
        ) : null}
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
