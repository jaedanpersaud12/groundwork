import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Examples } from "@/app/examples";
import { cn } from "@/lib/utils";

import { Command, DataPlate } from "../../../_site/code";
import { SourceBlock } from "../../../_site/code-block";
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
        <Examples name={item.name} fallback="No visual preview — this item has no markup of its own." />
      </Section>

      <Section id="install" title="Install">
        <p className="max-w-prose text-sm text-muted-foreground">
          Needs a project already initialised on the contract, which is what registers the{" "}
          <code className="font-mono">@ja3dan</code> prefix. If yours isn&apos;t,{" "}
          <Link href="/docs#design-system" className={TEXT_LINK}>
            run the setup command first
          </Link>
          .
        </p>
        <Command value={installCommand(item.name)} />
        {item.packages.length ? (
          <p className="text-sm text-muted-foreground">
            Pulls in {item.packages.join(", ")} from npm if your project doesn&apos;t have them.
          </p>
        ) : null}
      </Section>

      {related ? (
        <Section id="related" title="Related items">
          <div className="grid gap-6 sm:grid-cols-2">
            {item.dependsOn.length ? (
              <div className="grid content-start gap-2">
                <p className="text-sm text-foreground">Installs alongside it</p>
                <ul className="grid gap-1">
                  {item.dependsOn.map((dep) => (
                    <li key={dep}>
                      <Link href={`/docs/components/${dep}`} className={cn("font-mono text-sm", TEXT_LINK)}>
                        {dep}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {usedBy.length ? (
              <div className="grid content-start gap-2">
                <p className="text-sm text-foreground">Used by</p>
                <ul className="grid gap-1">
                  {usedBy.map((dep) => (
                    <li key={dep.name}>
                      <Link href={`/docs/components/${dep.name}`} className={cn("font-mono text-sm", TEXT_LINK)}>
                        {dep.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {source.length ? (
        <Section
          id="source"
          title="Source"
          lead="What lands in your project, copied from the published item rather than the working tree."
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
