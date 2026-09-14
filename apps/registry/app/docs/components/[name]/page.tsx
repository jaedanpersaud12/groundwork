import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Examples } from "@/app/examples";
import { cn } from "@/lib/utils";

import { Command, DataPlate } from "../../../_site/code";
import { SourceBlock } from "../../../_site/code-block";
import { Chips, Code, Prose } from "../../../_site/docs-ui";
import { DocPage, Section } from "../../../_site/prose";
import {
  dependents,
  getGroup,
  getItem,
  getSource,
  installCommand,
  items,
  TRACK_LABEL,
} from "../../../_site/registry";
import { FOCUS_RING, TEXT_LINK } from "../../../_site/styles";
import type { TocEntry } from "../../../_site/toc";

export function generateStaticParams() {
  return items.map((item) => ({ name: item.name }));
}

export async function generateMetadata({ params }: PageProps<"/docs/components/[name]">): Promise<Metadata> {
  const item = getItem((await params).name);
  return item ? { title: item.title, description: item.description } : {};
}

export default async function ItemPage({ params }: PageProps<"/docs/components/[name]">) {
  const { name } = await params;
  const item = getItem(name);
  if (!item) notFound();

  const source = await getSource(item.name);
  const usedBy = dependents(item.name);
  const group = getGroup(item.tier);
  const related = item.dependsOn.length > 0 || usedBy.length > 0;

  const toc: TocEntry[] = [
    { id: "preview", label: "Preview" },
    { id: "install", label: "Install" },
    ...(related ? [{ id: "related", label: "Related items" }] : []),
    ...(source.length ? [{ id: "source", label: "Source" }] : []),
  ];

  return (
    <DocPage
      title={item.title}
      lead={item.description}
      toc={toc}
      eyebrow={
        <p>
          <Link href={`/#${group.tier}`} className={cn("rounded-sm hover:text-foreground", FOCUS_RING)}>
            {group.title}
          </Link>
          <span className="px-2 text-subtle-foreground">/</span>
          <span className="text-foreground">{item.title}</span>
        </p>
      }
      aside={
        <DataPlate
          cells={[
            { label: "Version", value: item.version },
            { label: "Tier", value: group.singular },
            { label: "Updates taken", value: TRACK_LABEL[item.track] },
            { label: "Files", value: `${item.files.length}` },
          ]}
        />
      }
    >
      <Section id="preview" title="Preview">
        <Examples name={item.name} fallback="No visual preview: this item has no markup of its own." />
      </Section>

      <Section id="install" title="Install">
        <Prose>
          In a project already set up on the contract, which is what registers the <Code>@ja3dan</Code> prefix. If
          yours isn&apos;t,{" "}
          <Link href="/docs#design-system" className={TEXT_LINK}>
            set it up first
          </Link>
          .
        </Prose>
        <Command value={installCommand(item.name)} wrap />
        {item.packages.length ? (
          <p className="text-sm text-muted-foreground">
            Also installs{" "}
            {item.packages.map((pkg, index) => (
              <span key={pkg}>
                <Code>{pkg}</Code>
                {index < item.packages.length - 1 ? " " : null}
              </span>
            ))}{" "}
            if the project doesn&apos;t have them.
          </p>
        ) : null}
      </Section>

      {related ? (
        <Section id="related" title="Related items">
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            {item.dependsOn.length ? (
              <div className="grid content-start gap-3">
                <h3 className="text-sm font-semibold text-foreground">Installs alongside it</h3>
                <Chips items={item.dependsOn.map((dep) => ({ href: `/docs/components/${dep}`, label: dep }))} />
              </div>
            ) : null}
            {usedBy.length ? (
              <div className="grid content-start gap-3">
                <h3 className="text-sm font-semibold text-foreground">Used by</h3>
                <Chips items={usedBy.map((dep) => ({ href: `/docs/components/${dep.name}`, label: dep.name }))} />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {source.length ? (
        <Section
          id="source"
          title="Source"
          lead="What lands in your project, read from the published item rather than the working tree."
        >
          <div className="grid grid-cols-1 gap-4">
            {source.map((file) => (
              <SourceBlock key={file.path} path={file.path} content={file.content} />
            ))}
          </div>
        </Section>
      ) : null}
    </DocPage>
  );
}
