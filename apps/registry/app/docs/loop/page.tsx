import type { Metadata } from "next";

import { Command } from "../../_site/code";
import { Code, FileTree, InfoCards, Note, Prose, Step, Steps } from "../../_site/docs-ui";
import { FEATURE_FILES, LOOP, OUT_OF_BAND, SKILLS } from "../../_site/kit";
import { DocPage, RepoText, Section } from "../../_site/prose";
import type { TocEntry } from "../../_site/toc";

export const metadata: Metadata = {
  title: "The loop",
  description: "The steps every feature takes, the files each one writes, and the one that refuses to close it.",
};

const TOC: TocEntry[] = [
  { id: "folder", label: "The feature folder" },
  { id: "order", label: "In order" },
  { id: "when-needed", label: "When needed" },
  { id: "teeth", label: "The rule with teeth" },
];

export default function LoopPage() {
  return (
    <DocPage
      title="The loop"
      lead={`${SKILLS.length} skills, installed by kit init. ${LOOP.length} steps run in order around every feature; ${OUT_OF_BAND.length} more run when something goes wrong.`}
      toc={TOC}
    >
      <Section
        id="folder"
        title="The feature folder"
        lead="Every step writes into one folder, so the next step and the next session start from files, not from the conversation."
      >
        <FileTree
          root="context/features/NN-slug/"
          label="The files a feature folder holds"
          lines={FEATURE_FILES.map((file) => ({ name: file.name, depth: 0, note: file.by }))}
        />
      </Section>

      <Section
        id="order"
        title="In order"
        lead="Each description is the skill's own, read from its SKILL.md."
      >
        <Steps>
          {LOOP.map((stage, index) => (
            <Step key={stage.title} number={index + 1} title={stage.title} last={index === LOOP.length - 1}>
              <Prose>
                <RepoText>{stage.body}</RepoText>
              </Prose>
              {stage.command ? <Command value={stage.command} prompt={false} /> : null}
              {stage.writes.length ? (
                <p className="text-sm text-muted-foreground">
                  Writes{" "}
                  {stage.writes.map((file, fileIndex) => (
                    <span key={file}>
                      <Code>{file}</Code>
                      {fileIndex < stage.writes.length - 1 ? " " : null}
                    </span>
                  ))}
                </p>
              ) : null}
            </Step>
          ))}
        </Steps>
      </Section>

      <Section
        id="when-needed"
        title="When needed"
        lead="Not part of the sequence. Each one exists because a specific thing kept going wrong."
      >
        <InfoCards
          items={OUT_OF_BAND.map((stage) => ({
            title: stage.title,
            code: stage.command,
            body: <RepoText>{stage.body}</RepoText>,
          }))}
        />
      </Section>

      <Section id="teeth" title="The rule with teeth">
        <Prose>
          <Code>/feature finish</Code> will not close a feature while any done when criterion lacks a line in{" "}
          <Code>log.md</Code> saying how it was checked: browser, SQL, script or test.
        </Prose>
        <Note title="Not verified is an answer. Silence is not.">
          A line that says <Code>not verified, because the staging data has no failed payment yet</Code> closes the
          criterion. A blank one stops the close.
        </Note>
      </Section>
    </DocPage>
  );
}
