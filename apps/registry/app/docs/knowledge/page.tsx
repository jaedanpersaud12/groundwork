import type { Metadata } from "next";
import { BookOpenIcon } from "lucide-react";

import { StatusPill } from "@/registry/groundwork/ui/status-pill";
import {
  DataTable,
  StackedCell,
  TableCard,
  TableCardHeader,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/registry/groundwork/ui/table-card";

import { CodeBlock } from "../../_site/code-block";
import { Code, Note, Prose } from "../../_site/docs-ui";
import { DocPage, Section } from "../../_site/prose";
import { knowledgeFiles } from "../../_site/repo";
import type { TocEntry } from "../../_site/toc";

export const metadata: Metadata = {
  title: "Knowledge",
  description: "Gotchas harvested from projects that already paid for them.",
};

const TOC: TocEntry[] = [
  { id: "files", label: "What's in it" },
  { id: "format", label: "The format" },
  { id: "bar", label: "What earns a place" },
];

/** Read at build time, so a harvested file appears on the next deploy with no page edit. */
const FILES = knowledgeFiles();

/** The format is shown with whichever file's first gotcha is shortest, so it reads in one glance. */
const SPECIMEN = [...FILES].filter((file) => file.firstGotcha).sort((a, b) => a.firstGotcha.length - b.firstGotcha.length)[0];

export default function KnowledgePage() {
  const total = FILES.reduce((sum, file) => sum + file.gotchas, 0);
  return (
    <DocPage
      title="Knowledge"
      lead="Things that cost real time because a tool behaved differently than its documentation said. Written by /harvest, tagged by stack, and installed to match what a project is built on."
      toc={TOC}
    >
      <Section id="files" title="What's in it" lead="Listed from the repo at build time.">
        <TableCard>
          <TableCardHeader
            icon={<BookOpenIcon />}
            title="knowledge/"
            note={`${FILES.length} files, ${total} gotchas`}
          />
          <DataTable columns={["", "w-52", "w-20", "w-32"]} minWidth={600}>
            <Thead>
              <tr>
                <Th>File</Th>
                <Th>Stack</Th>
                <Th align="right">Gotchas</Th>
                <Th>Verified</Th>
              </tr>
            </Thead>
            <Tbody>
              {FILES.map((file) => (
                <Tr key={file.file}>
                  <Td>
                    <StackedCell primary={file.title} secondary={file.file} />
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {file.stack.map((stack) => (
                        <StatusPill key={stack} tone="neutral" dot={false}>
                          {stack}
                        </StatusPill>
                      ))}
                    </span>
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">
                    {file.gotchas}
                  </Td>
                  <Td>
                    <StackedCell primary={file.verifiedOn} secondary={file.verifiedVersion} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </DataTable>
        </TableCard>
      </Section>

      {SPECIMEN ? (
        <Section
          id="format"
          title="The format"
          lead={`Frontmatter says who the file is for and how stale it is. Then one bullet per gotcha, bold claim first. This is ${SPECIMEN.file}, as committed.`}
        >
          <CodeBlock title={`knowledge/${SPECIMEN.file}`} lang="markdown" wrap code={`${SPECIMEN.frontmatter}\n\n${SPECIMEN.firstGotcha}`} />
          <Note title="Keep it true">
            <Code>verified_on</Code> tells a reader whether to trust the file or check it again. Update it whenever a
            bullet is confirmed against the installed tool, and never write an example from memory.
          </Note>
        </Section>
      ) : null}

      <Section
        id="bar"
        title="What earns a place"
        lead="A note earns its place only when the documentation is silent or wrong."
      >
        <Prose>
          Anything that restates the docs makes the rest of the file less likely to be read. The test is whether it cost
          someone an hour: a gotcha solved and not written down gets solved again in the next project.
        </Prose>
      </Section>
    </DocPage>
  );
}
