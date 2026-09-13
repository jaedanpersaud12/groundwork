import type { Metadata } from "next";

import contract from "@ja3dan/tokens/contract.json";

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

const tokenGroups = Object.entries(contract.tokens as Record<string, TokenMeta>).reduce<
  Record<string, { name: string; required: boolean; role: string }[]>
>((acc, [name, meta]) => {
  (acc[meta.group] ??= []).push({ name, required: meta.required, role: meta.role });
  return acc;
}, {});

const RULES = [
  {
    title: "Names and roles are the contract's business; values are a theme's",
    body: (
      <>
        A token whose role can&apos;t be stated without naming a colour is a value wearing a name&apos;s clothes.{" "}
        <code className="font-mono text-sm">primary</code> is &ldquo;brand action: primary button, selected state,
        links&rdquo;, not &ldquo;the violet one&rdquo;.
      </>
    ),
  },
  {
    title: "A required token is required in both selectors",
    body: (
      <>
        Every theme defines every required token in <code className="font-mono text-sm">:root</code> and in{" "}
        <code className="font-mono text-sm">.dark</code>. The build fails per selector, naming what is missing — because
        a value changed in one and forgotten in the other is the most common bug here.
      </>
    ),
  },
  {
    title: "Anything not every brand needs is optional",
    body: (
      <>
        <code className="font-mono text-sm">chart-*</code> and <code className="font-mono text-sm">sidebar-*</code> are
        optional for exactly this reason. A new required token is a breaking change for every theme that already exists.
      </>
    ),
  },
];

export default function TokensPage() {
  return (
    <DocPage
      title="Token contract"
      lead="The one thing every project and every component depends on. Components name tokens; themes supply the values, once for light and once for dark. That is what lets the same button take on each project's look without being forked."
      toc={TOC}
    >
      <Section
        id="names"
        title="The names"
        lead="Grouped by what they are for. A component may use any of these and nothing else — no hex, no palette class, no arbitrary value."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {Object.entries(tokenGroups).map(([group, tokens]) => (
            <div key={group} className="grid content-start gap-2">
              <p className="type-section text-sm text-foreground">{group}</p>
              <dl className="grid gap-2">
                {tokens.map((token) => (
                  <div key={token.name} className="grid gap-0.5">
                    <dt className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-mono text-xs text-foreground">{token.name}</span>
                      {token.required ? null : <span className="text-xs text-subtle-foreground">optional</span>}
                    </dt>
                    <dd className="text-sm text-muted-foreground">{token.role}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section id="rules" title="The rules">
        <dl className="grid gap-6">
          {RULES.map((rule) => (
            <div key={rule.title} className="grid gap-1.5 border-s border-border ps-4">
              <dt className="text-sm text-foreground">{rule.title}</dt>
              <dd className="max-w-prose text-sm text-muted-foreground">{rule.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="changing" title="Changing it">
        <p className="max-w-prose text-muted-foreground">
          If a component needs a colour the contract does not have, that is a contract conversation — not a local
          exception. Exceptions are how a lint rule turns into an allowlist of workarounds.
        </p>
        <p className="max-w-prose text-muted-foreground">
          The generated files are not editable by hand. Change the contract, regenerate, and the build validates every
          theme against it. A hook blocks the direct edit, because this was prose once and prose did not hold.
        </p>
      </Section>
    </DocPage>
  );
}
