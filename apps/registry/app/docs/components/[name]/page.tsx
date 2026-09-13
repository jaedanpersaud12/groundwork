import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Examples } from "@/app/examples";

import { Command, DataPlate, SourceBlock } from "../../../_site/code";
import { dependents, getItem, getSource, groups, installCommand, items, TRACK_LABEL } from "../../../_site/registry";
import { Toc, type TocEntry } from "../../../_site/toc";

export function generateStaticParams() {
  return items.map((item) => ({ name: item.name }));
}

export async function generateMetadata({ params }: PageProps<"/docs/components/[name]">): Promise<Metadata> {
  const item = getItem((await params).name);
  return item ? { title: item.title, description: item.description } : {};
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid scroll-mt-24 gap-3 pt-10">
      <h2 id={id} className="type-section scroll-mt-24 text-lg text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ItemPage({ params }: PageProps<"/docs/components/[name]">) {
  const { name } = await params;
  const item = getItem(name);
  if (!item) notFound();

  const source = await getSource(item.name);
  const usedBy = dependents(item.name);
  const group = groups.find((candidate) => candidate.tier === item.tier);
  const related = item.dependsOn.length > 0 || usedBy.length > 0;

  const toc: TocEntry[] = [
    { id: "preview", label: "Preview" },
    { id: "install", label: "Install" },
    ...(related ? [{ id: "related", label: "Related items" }] : []),
    ...(source.length ? [{ id: "source", label: "Source" }] : []),
  ];

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-12">
      <article className="min-w-0">
        <p className="text-sm text-muted-foreground">
          {group ? (
            <>
              <Link
                href="/docs"
                className="rounded-sm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {group.title}
              </Link>
              <span className="px-2 text-subtle-foreground">/</span>
            </>
          ) : null}
          <span className="text-foreground">{item.title}</span>
        </p>

        <h1 className="type-display mt-3 text-4xl text-foreground">{item.title}</h1>
        <p className="mt-3 max-w-prose text-muted-foreground">{item.description}</p>

        <div className="mt-6">
          <DataPlate
            cells={[
              { label: "Version", value: item.version },
              { label: "Tier", value: group?.title.replace(/s$/, "") ?? item.tier },
              { label: "Updates taken", value: TRACK_LABEL[item.track] },
              { label: "Files", value: `${item.files.length}` },
            ]}
          />
        </div>

        <Section id="preview" title="Preview">
          <Examples
            name={item.name}
            fallback="No visual preview — this item has no markup of its own. The blocks and patterns above use it."
          />
        </Section>

        <Section id="install" title="Install">
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
                <div className="grid gap-2">
                  <p className="text-sm text-foreground">Installs alongside it</p>
                  <ul className="grid gap-1">
                    {item.dependsOn.map((dep) => (
                      <li key={dep}>
                        <Link
                          href={`/docs/components/${dep}`}
                          className="rounded-sm font-mono text-sm text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          {dep}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {usedBy.length ? (
                <div className="grid gap-2">
                  <p className="text-sm text-foreground">Used by</p>
                  <ul className="grid gap-1">
                    {usedBy.map((dep) => (
                      <li key={dep.name}>
                        <Link
                          href={`/docs/components/${dep.name}`}
                          className="rounded-sm font-mono text-sm text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
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
          <Section id="source" title="Source">
            <p className="text-sm text-muted-foreground">
              What lands in your project, copied from the published item rather than the working tree.
            </p>
            <div className="grid gap-4">
              {source.map((file) => (
                <SourceBlock key={file.path} path={file.path} content={file.content} />
              ))}
            </div>
          </Section>
        ) : null}
      </article>

      <Toc entries={toc} />
    </div>
  );
}
