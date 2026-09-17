import type { Metadata } from "next";

import contract from "@ja3dan/tokens/contract.json";

import { CODE_FRAME } from "../../_site/code";
import { Code, CommandList, Note, Prose, Rows } from "../../_site/docs-ui";
import { DocPage, Section } from "../../_site/prose";
import type { TocEntry } from "../../_site/toc";

export const metadata: Metadata = {
  title: "Token contract",
  description: "Every colour name a component is allowed to use, and what each one is for.",
};

const TOC: TocEntry[] = [
  { id: "names", label: "The names" },
  { id: "rules", label: "The rules" },
  { id: "changing", label: "Changing it" },
];

type TokenMeta = { group: string; required: boolean; role: string };

/** Grouped in the contract's own order, straight from contract.json. */
const GROUPS = Object.entries(contract.tokens as Record<string, TokenMeta>).reduce<
  { group: string; tokens: { name: string; required: boolean; role: string }[] }[]
>((acc, [name, meta]) => {
  const existing = acc.find((entry) => entry.group === meta.group);
  const token = { name, required: meta.required, role: meta.role };
  if (existing) existing.tokens.push(token);
  else acc.push({ group: meta.group, tokens: [token] });
  return acc;
}, []);

const TOTAL = Object.keys(contract.tokens).length;

export default function TokensPage() {
  return (
    <DocPage
      title="Token contract"
      lead="Components name tokens; themes supply the values, once for light and once for dark. That is what lets the same button take on each project's look without being forked."
      toc={TOC}
    >
      <Section
        id="names"
        title="The names"
        lead={`${TOTAL} tokens. A component may use these and nothing else. The swatches are the current theme's values, so they change with the theme toggle.`}
      >
        <div className="grid min-w-0 grid-cols-1 gap-8">
          {GROUPS.map(({ group, tokens }) => (
            <div key={group} className="grid min-w-0 grid-cols-1 gap-3">
              <h3 className="flex items-baseline gap-2 text-sm font-semibold text-foreground">
                {group.charAt(0).toUpperCase() + group.slice(1)}
                <span className="font-normal text-subtle-foreground tabular-nums">{tokens.length}</span>
              </h3>
              <ul className={`${CODE_FRAME} grid grid-cols-1 divide-y divide-border`}>
                {tokens.map((token) => (
                  <li
                    key={token.name}
                    className="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[1.5rem_12rem_minmax(0,1fr)]"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 size-5 rounded-md ring-1 ring-foreground/10 ring-inset"
                      style={{ background: `var(--${token.name})` }}
                    />
                    <span className="flex min-w-0 items-baseline gap-2">
                      <code className="truncate font-mono text-xs text-card-foreground">{token.name}</code>
                      {token.required ? null : <span className="text-xs text-subtle-foreground">optional</span>}
                    </span>
                    <span className="col-start-2 text-sm text-pretty text-muted-foreground sm:col-start-3">{token.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="rules" title="The rules">
        <Rows
          items={[
            {
              title: "Names and roles belong to the contract; values belong to a theme",
              body: (
                <>
                  If a role can&apos;t be stated without naming a colour, it is a value, not a name.{" "}
                  <Code>primary</Code> is the brand action, not the blue one.
                </>
              ),
            },
            {
              title: "A required token is required in both selectors",
              body: (
                <>
                  Every theme defines every required token in <Code>:root</Code> and in <Code>.dark</Code>. The build
                  fails per selector and names what is missing. A project theme with no dark mode on purpose — a gallery,
                  a print-first portfolio — says so with the comment <Code>{"/* @ja3dan/tokens light-only */"}</Code>, and{" "}
                  <Code>kit check</Code> then requires <Code>:root</Code> only.
                </>
              ),
            },
            {
              title: "Anything not every brand needs is optional",
              body: (
                <>
                  <Code>chart-*</Code> and <Code>sidebar-*</Code> are optional for that reason. A new required token
                  breaks every theme that already exists.
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section
        id="changing"
        title="Changing it"
        lead="A component that needs a colour the contract doesn't have is a contract change, not a local exception."
      >
        <CommandList
          items={[{ command: "bun run tokens", note: "regenerate theme.css and TOKENS.md, and validate every theme" }]}
        />
        <Note title="The generated files are not edited by hand">
          Change <Code file="packages/tokens/contract.json">contract.json</Code> and regenerate. A hook blocks direct edits to <Code file="packages/tokens/theme.css">theme.css</Code> and{" "}
          <Code file="packages/tokens/TOKENS.md">TOKENS.md</Code>.
        </Note>
        <Prose>Exceptions are how a lint rule turns into an allowlist of workarounds.</Prose>
      </Section>
    </DocPage>
  );
}
