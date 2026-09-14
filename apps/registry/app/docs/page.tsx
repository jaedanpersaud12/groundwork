import type { Metadata } from "next";
import Link from "next/link";

import { Command } from "../_site/code";
import { HALVES } from "../_site/kit";
import { DocPage, Section } from "../_site/prose";
import { items, setup, setupCommand } from "../_site/registry";
import { FOCUS_RING, TEXT_LINK } from "../_site/styles";
import type { TocEntry } from "../_site/toc";

export const metadata: Metadata = {
  title: "Start here",
  description: "What groundwork puts into a new repo, and the two commands that put it there.",
};

const TOC: TocEntry[] = [
  { id: "halves", label: "The two halves" },
  { id: "setup", label: "Set up a project" },
  { id: "next", label: "Where to go next" },
];

const NEXT = [
  { href: "/docs/loop", title: "The loop", body: "The skills a feature passes through, and the one that refuses to close it." },
  { href: "/docs/context", title: "Context", body: "What gets written down before any code exists, and why the tracker is four lines long." },
  { href: "/docs/knowledge", title: "Knowledge", body: "Gotchas that only earn a place when the documentation is silent or wrong." },
  { href: "/docs/kickoff", title: "Kickoff", body: "The three prompts that write a new project's context/ folder before any code exists." },
  { href: "/docs/tokens", title: "Token contract", body: "Every colour name a component is allowed to use, and what each one is for." },
];

export default function DocsHome() {
  return (
    <DocPage
      title="Start here"
      lead="Groundwork lays a repo's foundation before you write any code: the skills and context your agents work from, a token contract your components can't break, and the gotchas you already paid for somewhere else."
      toc={TOC}
    >
      <Section
        id="halves"
        title="The two halves"
        lead="They are independent. A project can take the design system without the kit, or the kit without the design system — but the point of the thing is that most projects take both."
      >
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
          {HALVES.map((half) => (
            <div key={half.title} className="grid content-start gap-4 bg-card p-5">
              <div className="grid gap-2">
                <h3 className="type-section text-base text-card-foreground">{half.title}</h3>
                <p className="text-sm text-muted-foreground">{half.lead}</p>
              </div>
              <dl className="grid gap-2">
                {half.parts.map((part) => (
                  <div key={part.name} className="grid gap-0.5">
                    <dt className="font-mono text-xs text-foreground">{part.name}</dt>
                    <dd className="text-sm text-muted-foreground">{part.body}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={half.href}
                className={`mt-auto justify-self-start pt-1 text-sm ${TEXT_LINK}`}
              >
                {half.linkLabel}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="setup"
        title="Set up a project"
        lead="Two commands. The first is the only one that differs from any other shadcn project."
      >
        <ol className="grid grid-cols-1 gap-6">
          <li className="grid min-w-0 grid-cols-1 gap-2">
            <p className="text-sm text-foreground">
              <span className="text-subtle-foreground">1.</span> Initialise on the contract.
            </p>
            <p className="max-w-prose text-sm text-muted-foreground">{setup.description}</p>
            <Command value={setupCommand} />
          </li>
          <li className="grid min-w-0 grid-cols-1 gap-2">
            <p className="text-sm text-foreground">
              <span className="text-subtle-foreground">2.</span> Replace shadcn&apos;s default button with this one,
              then add any of the other {items.length - 1}.
            </p>
            <Command value="bunx shadcn@latest add @ja3dan/button --overwrite" />
          </li>
        </ol>
        <p className="max-w-prose text-sm text-muted-foreground">{setup.docs}</p>
        <p className="max-w-prose text-sm text-muted-foreground">
          These commands set up the design system and nothing else: <code className="font-mono">shadcn init</code>{" "}
          does not create skills, a <code className="font-mono">context/</code> folder or knowledge files. The agent
          kit installs separately — see{" "}
          <Link href="/docs/kickoff" className={TEXT_LINK}>
            kickoff
          </Link>{" "}
          for the three prompts that write one by hand, in any LLM, before the automated half (
          <code className="font-mono">kit init</code>) exists.
        </p>
      </Section>

      <Section id="next" title="Where to go next">
        <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
          {NEXT.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className={`grid content-start gap-1 bg-card p-4 transition-colors hover:bg-accent ${FOCUS_RING}`}
            >
              <dt className="type-section text-sm text-card-foreground">{entry.title}</dt>
              <dd className="text-sm text-muted-foreground">{entry.body}</dd>
            </Link>
          ))}
        </dl>
      </Section>
    </DocPage>
  );
}
