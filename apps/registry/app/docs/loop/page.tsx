import type { Metadata } from "next";

import { LOOP, OUT_OF_BAND, SKILLS } from "../../_site/kit";
import { DocPage, RepoText, Section } from "../../_site/prose";
import type { TocEntry } from "../../_site/toc";

export const metadata: Metadata = {
  title: "The loop",
  description: "The commands a feature passes through, and the one that refuses to close it.",
};

const TOC: TocEntry[] = [
  { id: "order", label: "In order" },
  { id: "when-needed", label: "When needed" },
  { id: "teeth", label: "The rule with teeth" },
];

export default function LoopPage() {
  return (
    <DocPage
      title="The loop"
      lead={`${SKILLS.length} skills, installed into the project so the agent has them from the first session. ${LOOP.length} steps run in order around a piece of work — /feature opens and closes it — and ${OUT_OF_BAND.length} more skills run when something happens.`}
      toc={TOC}
    >
      <Section
        id="order"
        title="In order"
        lead="Most steps leave a file behind, in the feature's own folder. That is what lets the next step — and the next session — start from something other than the conversation. Each description below is the skill's own, read from its SKILL.md."
      >
        <ol className="grid gap-px overflow-hidden rounded-md border border-border bg-border">
          {LOOP.map((stage, index) => (
            <li key={stage.title} className="grid gap-2 bg-card p-5 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-5">
              <span className="font-mono text-sm text-subtle-foreground">{index + 1}</span>
              <div className="grid gap-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="type-section text-base text-card-foreground">{stage.title}</h3>
                  {stage.command ? (
                    <code className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {stage.command}
                    </code>
                  ) : null}
                </div>
                <p className="max-w-prose text-sm text-muted-foreground">
                  <RepoText>{stage.body}</RepoText>
                </p>
                {stage.writes.length ? (
                  <p className="text-xs text-subtle-foreground">
                    Writes <span className="font-mono">{stage.writes.join(", ")}</span>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="when-needed"
        title="When needed"
        lead="Not part of the sequence. Each one exists because a specific thing kept going wrong."
      >
        <dl className="grid gap-6">
          {OUT_OF_BAND.map((stage) => (
            <div key={stage.title} className="grid gap-1.5 border-s border-border ps-4">
              <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="type-section text-sm text-foreground">{stage.title}</span>
                <code className="font-mono text-xs text-muted-foreground">{stage.command}</code>
              </dt>
              <dd className="max-w-prose text-sm text-muted-foreground">
                <RepoText>{stage.body}</RepoText>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="teeth" title="The rule with teeth">
        <p className="max-w-prose text-muted-foreground">
          <code className="font-mono text-sm">/feature finish</code> will not close a feature while any
          &ldquo;done when&rdquo; criterion lacks a line in the log saying how it was checked — browser, SQL, script,
          test — or an explicit <em>not verified, because …</em>
        </p>
        <p className="max-w-prose text-muted-foreground">
          That second form closes a criterion perfectly well. Silence does not. The point of putting the check at the
          end of the loop rather than in someone&apos;s head is that it is harder to skip than remembering would be.
        </p>
      </Section>
    </DocPage>
  );
}
