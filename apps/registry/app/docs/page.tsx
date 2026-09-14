import type { Metadata } from "next";
import Link from "next/link";

import { Command } from "../_site/code";
import { CodeBlock } from "../_site/code-block";
import { Code, CommandList, FileTree, LinkCards, Note, Prose, Step, Steps } from "../_site/docs-ui";
import { KICKOFF, KIT_DOCS, KIT_INIT, PROJECT_TREE } from "../_site/kit";
import { DocPage, Section } from "../_site/prose";
import { items, setup, setupCommand } from "../_site/registry";
import { TEXT_LINK } from "../_site/styles";
import type { TocEntry } from "../_site/toc";

export const metadata: Metadata = {
  title: "Set up a project",
  description: "Set up a project with the whole kit through kit init, or add only the design system with shadcn.",
};

const TOC: TocEntry[] = [
  { id: "whole-kit", label: "The whole kit" },
  { id: "design-system", label: "Only the design system" },
  { id: "keep-current", label: "Keep it current" },
  { id: "next", label: "Where to go next" },
];

const kit = (command: string) => `bunx @ja3dan/kit ${command}`;

/** What `kit init` writes: every tree line step 1 owns, plus the folders that hold them. */
const INIT_TREE = PROJECT_TREE.filter(
  (line, index, all) =>
    line.step === 1 ||
    (line.step === undefined && all.slice(index + 1).some((next) => next.depth > line.depth && next.step === 1)),
);

/** The imports `shadcn init` adds to the project's CSS, as the setup item declares them. */
const SETUP_IMPORTS = (setup as { css?: Record<string, unknown> }).css
  ? Object.keys((setup as { css: Record<string, unknown> }).css)
      .map((line) => `${line};`)
      .join("\n")
  : "";

export default function SetupPage() {
  return (
    <DocPage
      title="Set up a project"
      lead="Start a new project with the whole kit, or add the design system to one you already have."
      toc={TOC}
      aside={
        <LinkCards
          items={[
            {
              href: "#whole-kit",
              title: "The whole kit",
              body: "Skills, context and the design system in a new Next.js app, locked together by kit init.",
              meta: "5 steps",
            },
            {
              href: "#design-system",
              title: "Only the design system",
              body: "The tokens, a theme, the lint rule and the components, added to an app you already have.",
              meta: "4 steps",
            },
          ]}
        />
      }
    >
      <Section
        id="whole-kit"
        title="The whole kit"
        lead="From an empty folder to a first feature. Run these once, in order."
      >
        <Steps>
          <Step number={1} title="Create the app">
            <Prose>
              A Next.js app with TypeScript, Tailwind, ESLint and the App Router. <Code>kit init</Code> edits the
              files this creates, so pass the flags rather than relying on saved preferences.
            </Prose>
            <Command value="bunx create-next-app@latest your-app --ts --tailwind --eslint --app --use-bun --yes" wrap />
          </Step>

          <Step number={2} title="Run kit init">
            <Prose>
              Copies the house style into <Code>context/</Code>, installs the lifecycle skills, runs shadcn init against
              the registry, removes the leftover CSS that would override the theme, wires the lint rule, adds a check
              script, and locks what it installed.
            </Prose>
            <Command value={`cd your-app && ${KIT_INIT.command}`} wrap />
            <FileTree root="your-app/" label="Files kit init writes" lines={INIT_TREE} />
          </Step>

          <Step number={3} title="Write the context">
            <Prose>
              Paste the kickoff prompts into any LLM chat, in order, and save each answer into <Code>context/</Code>.
              Each answer is the next prompt&apos;s input.
            </Prose>
            <FileTree
              root="your-app/"
              label="Files the kickoff prompts write"
              lines={[
                { name: "context/", depth: 0 },
                ...KICKOFF.map((entry) => ({ name: entry.output, depth: 1, note: `from ${entry.prompt}` })),
              ]}
            />
            <Link href="/docs/kickoff" className={`justify-self-start text-sm ${TEXT_LINK}`}>
              Read the prompts
            </Link>
          </Step>

          <Step number={4} title="Check the project">
            <Prose>All three should pass before the first feature.</Prose>
            <CommandList
              items={[
                { command: kit("doctor"), note: KIT_DOCS.usage.doctor },
                { command: kit("check"), note: KIT_DOCS.usage.check },
                { command: "bun run check", note: "typecheck and lint, including no-raw-colors" },
              ]}
            />
          </Step>

          <Step number={5} title="Start the first feature" last>
            <Prose>
              In Claude Code, from the project. The feature skill opens a branch and a folder, and writes the spec with
              its done when criteria.
            </Prose>
            <Command value="/feature start 01" wrap />
            <Link href="/docs/loop" className={`justify-self-start text-sm ${TEXT_LINK}`}>
              Read the loop
            </Link>
          </Step>
        </Steps>
      </Section>

      <Section
        id="design-system"
        title="Only the design system"
        lead="shadcn does the install. Two things kit init would have done are yours to do by hand."
      >
        <Note title="Before you start, in an app with its own styles">
          Search the codebase for the contract&apos;s token names (<Code>primary</Code>, <Code>accent</Code>,{" "}
          <Code>success</Code> and the rest). A name the app already uses for something else takes on the
          contract&apos;s meaning once the theme loads. Override it straight after the imports.
        </Note>

        <Steps>
          <Step number={1} title="Initialise on the contract">
            <Prose>{setup.description}</Prose>
            <Command value={setupCommand} wrap />
          </Step>

          <Step number={2} title="Remove the leftover CSS">
            <Prose>
              In a fresh create-next-app project, <Code>app/globals.css</Code> keeps its own colour variables, a dark
              media query copy and a <Code>body</Code> rule after the imports, and they override the theme. Keep the
              imports below and any <Code>--font-*</Code> lines; delete the rest.
            </Prose>
            <CodeBlock title="app/globals.css" code={SETUP_IMPORTS} />
          </Step>

          <Step number={3} title="Wire the lint rule">
            <Prose>
              The plugin is installed but does not run until the config names it. Add these two lines to{" "}
              <Code>eslint.config.mjs</Code>.
            </Prose>
            <CodeBlock
              title="eslint.config.mjs"
              wrap
              code={`${KIT_DOCS.eslint.importLine};\n\n// inside the config array:\n${KIT_DOCS.eslint.entry}`}
            />
          </Step>

          <Step number={4} title="Add components" last>
            <Prose>
              Start with the button, which replaces shadcn&apos;s, then add any of the other {items.length - 1}.
            </Prose>
            <Command value="bunx shadcn@latest add @ja3dan/button --overwrite" wrap />
            <Link href="/docs/components/data-table" className={`justify-self-start text-sm ${TEXT_LINK}`}>
              Browse the components
            </Link>
          </Step>
        </Steps>
      </Section>

      <Section
        id="keep-current"
        title="Keep it current"
        lead="Installed components are yours to edit. The kit tells you when a newer version exists and merges it with your edits."
      >
        <CommandList
          items={[
            { command: kit("sync status"), note: KIT_DOCS.usage.syncStatus },
            { command: kit("sync update <item>"), note: KIT_DOCS.usage.syncUpdate },
          ]}
        />
      </Section>

      <Section id="next" title="Where to go next">
        <LinkCards
          items={[
            { href: "/docs/loop", title: "The loop", body: "The steps every feature takes, and the one that refuses to close it." },
            { href: "/docs/context", title: "Context", body: "What gets written down before any code exists." },
            { href: "/docs/kickoff", title: "Kickoff", body: "The three prompts that write a project's context." },
            { href: "/docs/knowledge", title: "Knowledge", body: "Gotchas already paid for, installed to match the stack." },
            { href: "/docs/tokens", title: "Token contract", body: "Every colour name a component may use, and what it is for." },
            { href: "/docs/components/data-table", title: "Components", body: `${items.length} items, each with a live preview and its source.` },
          ]}
        />
      </Section>
    </DocPage>
  );
}
