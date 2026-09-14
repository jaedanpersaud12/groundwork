import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import background from "@/public/backgrounds/background.webp";
import nightCliff from "@/public/HR0LNgXbgAAa7sy.jpeg";
import nightCove from "@/public/HR0LQMRW8A4qAWP.jpeg";
import { Button } from "@/registry/groundwork/ui/button";
import { StatusPill } from "@/registry/groundwork/ui/status-pill";

import { Command } from "./_site/code";
import { SiteHeader } from "./_site/header";
import { EVIDENCE, LOOP, STATS } from "./_site/kit";
import { FeatureTable } from "./_site/landing/feature-table";
import { FilterChipDemo, ViewToggleDemo } from "./_site/landing/specimen";
import { groups, items, setupCommand } from "./_site/registry";
import { Reveal } from "./_site/reveal";
import { FOCUS_RING, TEXT_LINK } from "./_site/styles";

/*
 * The page's structure. Every section below follows it, and a change that breaks it is the
 * thing to fix, not the rule.
 *
 * Edges. Two vertical edges only: the leading margin, and the halfway line. Two-up layouts
 *   are `lg:grid-cols-2 gap-4`, so the second column always starts on the same x.
 * Openings. Every section after the hero opens with <SectionHead>: a heading over one
 *   sentence, then 56px to the content.
 * Surfaces. A panel is the contract's raised surface (`bg-card shadow-border`), the same one
 *   the registry's own TableCard uses. Code inside a panel sits on `bg-muted`.
 * Rows. Panels side by side share their rows through `grid-rows-subgrid`, so titles,
 *   artefacts and links line up across the pair however long either one's copy runs.
 * Spacing. 8px inside a group, 24px between groups in a panel, 16px between panels,
 *   56px from a section's opening to its content, 112-128px between sections (2x that).
 */

const PANEL = "rounded-2xl bg-card text-card-foreground shadow-border";

const [KIT, DESIGN] = EVIDENCE;



function SectionHead({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="grid max-w-2xl gap-3">
      <h2 className="type-display text-[clamp(1.875rem,3vw,2.5rem)] text-foreground">{title}</h2>
      <p className="text-lg text-pretty text-muted-foreground">{lead}</p>
    </div>
  );
}

function More({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className={`inline-flex shrink-0 items-center gap-1.5 text-sm ${TEXT_LINK}`}>
      {children}
      <ArrowRightIcon aria-hidden className="size-3.5 rtl:-scale-x-100" />
    </Link>
  );
}

/** A file, shown as a file: its path above, its contents on the muted ground. */
function FilePanel({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <figure className="grid min-w-0 content-start overflow-hidden rounded-lg bg-muted">
      <figcaption className="border-b border-border px-4 py-2.5 font-mono text-xs text-muted-foreground">{path}</figcaption>
      <div className="scroll-slim overflow-x-auto px-4 py-4 font-mono text-[13px] leading-6">{children}</div>
    </figure>
  );
}

export default function Home() {
  const frontmatter = KIT.artefact.kind === "source" ? KIT.artefact.content.split("\n") : [];
  const lint = DESIGN.artefact.kind === "lint" ? DESIGN.artefact : null;
  const [before, after] = lint ? lint.violation.split(lint.offending) : ["", ""];
  const tier = (name: string) => groups.find((group) => group.tier === name);
  const primitives = tier("primitive");
  const patterns = tier("pattern");
  const smaller = [tier("block"), tier("hook"), tier("lib")].filter((group) => group && group.items.length > 0);

  return (
    <>
      <SiteHeader variant="plate" />
      <main id="content">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-36 pb-14 sm:px-6 lg:pt-44 lg:pb-16">
          <h1 className="animate-in type-display text-[clamp(2.75rem,6.2vw,5.5rem)] text-foreground duration-700 ease-out fade-in slide-in-from-bottom-3">
            Start where the last project finished.
          </h1>
          <div className="mt-12 grid animate-in grid-cols-1 gap-6 delay-100 duration-700 ease-out fade-in lg:grid-cols-2 lg:items-end lg:gap-4">
            <p className="max-w-md text-lg text-pretty text-muted-foreground">
              Agent skills, project context and a token contract, in your repo before the first line of code.
            </p>
            <div className="grid min-w-0 grid-cols-1 gap-2">
              <Command value={setupCommand} />
              <a href="#registry" className={`inline-flex items-center gap-1.5 justify-self-start text-sm ${TEXT_LINK}`}>
                Browse components
                <ArrowRightIcon aria-hidden className="size-3.5 rtl:-scale-x-100" />
              </a>
            </div>
          </div>
        </section>

        <div className="relative h-[clamp(16rem,40vw,34rem)] w-full animate-in overflow-hidden delay-200 duration-1000 ease-out fade-in">
          <Image
            src={background}
            alt="An illustrated valley below snow-capped mountains, a golden tree beside a river"
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-[center_42%]"
          />
        </div>

        {/* The two halves: one panel each, identical anatomy, rows shared. */}
        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 pt-20 pb-14 sm:px-6 lg:pt-28 lg:pb-16">
            <SectionHead title="Two halves" lead="Take either one on its own. Most projects take both." />

            <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-[auto_1fr_auto]">
              <article className={`${PANEL} grid min-w-0 grid-cols-1 gap-6 p-6 sm:p-8 lg:row-span-3 lg:grid-rows-subgrid`}>
                <div className="grid content-start gap-2">
                  <h3 className="type-section text-lg">The agent kit</h3>
                  <p className="text-muted-foreground">Skills your agents run, and the context they read before they touch code.</p>
                </div>
                <FilePanel path={KIT.artefact.kind === "source" ? KIT.artefact.path : ""}>
                  <ol>
                    {frontmatter.map((line, index) => (
                      <li key={index} className="grid grid-cols-[1.5rem_minmax(0,1fr)]">
                        <span aria-hidden className="text-subtle-foreground tabular-nums select-none">
                          {index + 1}
                        </span>
                        <span className="whitespace-pre-wrap text-foreground">{line}</span>
                      </li>
                    ))}
                  </ol>
                </FilePanel>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                  <p className="font-mono text-xs text-subtle-foreground">{STATS.skills} skills, installed by kit init</p>
                  <More href="/docs/loop">Read the loop</More>
                </div>
              </article>

              <article className={`${PANEL} grid min-w-0 grid-cols-1 gap-6 p-6 sm:p-8 lg:row-span-3 lg:grid-rows-subgrid`}>
                <div className="grid content-start gap-2">
                  <h3 className="type-section text-lg">The design system</h3>
                  <p className="text-muted-foreground">One contract every component obeys, and a lint rule that enforces it.</p>
                </div>
                {lint ? (
                  <FilePanel path={lint.path}>
                    <p className="whitespace-pre text-muted-foreground">
                      <span className="sr-only">Fails: </span>
                      {before}
                      <span className="text-foreground underline decoration-destructive decoration-wavy decoration-1 underline-offset-[5px]">
                        {lint.offending}
                      </span>
                      {after}
                    </p>
                    <p className="whitespace-pre text-success">
                      <span className="sr-only">Passes: </span>
                      {lint.fix}
                    </p>
                    <p className="mt-4 border-t border-border pt-4 text-destructive">{lint.message}</p>
                  </FilePanel>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                  <p className="font-mono text-xs text-subtle-foreground">
                    {STATS.tokens} tokens, {STATS.themes} themes
                  </p>
                  <More href="/docs/tokens">Read the contract</More>
                </div>
              </article>
            </div>
          </section>
        </Reveal>

        {/* The loop: one panel, five columns, the same three rows in each. */}
        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
            <SectionHead
              title="Every feature takes the same path"
              lead="Most steps leave a file in the feature's folder. The last one will not close while a criterion lacks evidence."
            />

            <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Plate
                src={nightCove}
                alt="A figure walking a moonlit cove, palms silhouetted in blue with gold edges"
                focus="object-[center_30%]"
              />
              <ol className={`${PANEL} grid min-w-0 divide-y divide-border`}>
                {LOOP.map((stage) => (
                  <li key={stage.title} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 px-6 py-5 sm:px-8">
                    <h3 className="type-section text-lg text-foreground">{stage.title}</h3>
                    <p className="row-span-2 self-center font-mono text-xs text-subtle-foreground">
                      {stage.writes.length ? stage.writes.join(", ") : "opens the PR"}
                    </p>
                    <code className="font-mono text-xs text-primary">{stage.command || "the work"}</code>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6">
              <More href="/docs/loop">Read the loop</More>
            </div>
          </section>
        </Reveal>

        {/* The registry: two working panels, then the full index in one panel. */}
        <Reveal>
          <section id="registry" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 lg:py-16">
            <SectionHead
              title={`${items.length} components, yours to edit`}
              lead="Copied in by shadcn and versioned, so a later update can merge with your edits."
            />

            <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Block name="data-table" tier="Block" wide>
                <FeatureTable rows={3} className="w-full" />
              </Block>
              <Block name="status-pill" tier="Primitive">
                <div className="flex flex-wrap justify-center gap-2">
                  <StatusPill tone="success">Merged</StatusPill>
                  <StatusPill tone="warning">In review</StatusPill>
                  <StatusPill tone="danger">Failing</StatusPill>
                  <StatusPill tone="neutral">Draft</StatusPill>
                </div>
              </Block>
              <Block name="filter-chip" tier="Pattern">
                <FilterChipDemo />
              </Block>
              <Block name="button" tier="Primitive">
                <div className="flex flex-wrap justify-center gap-3">
                  <Button>Save</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </Block>
              <Block name="view-toggle" tier="Primitive">
                <ViewToggleDemo />
              </Block>
            </ul>

            <div className={`${PANEL} mt-4 grid gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:gap-4`}>
              {primitives ? (
                <div className="grid content-start gap-3 lg:col-span-6">
                  <IndexHeading title={primitives.title} count={primitives.items.length} />
                  <IndexList names={primitives.items.map((item) => item.name)} columns />
                </div>
              ) : null}
              {patterns ? (
                <div className="grid content-start gap-3 lg:col-span-3">
                  <IndexHeading title={patterns.title} count={patterns.items.length} />
                  <IndexList names={patterns.items.map((item) => item.name)} />
                </div>
              ) : null}
              <div className="grid content-start gap-6 lg:col-span-3">
                {smaller.map((group) =>
                  group ? (
                    <div key={group.tier} className="grid content-start gap-3">
                      <IndexHeading title={group.title} count={group.items.length} />
                      <IndexList names={group.items.map((item) => item.name)} />
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Close: the two commands, as a pair of panels on the same rows. */}
        <Reveal>
          <section id="start" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 lg:py-16">
            <SectionHead title="Two commands to start" lead="Initialise a project on the contract, then add what you need." />

            <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ol className="grid min-w-0 grid-cols-1 gap-4">
                <li className={`${PANEL} grid min-w-0 grid-cols-1 content-between gap-6 p-6 sm:p-8`}>
                  <div className="grid content-start gap-2">
                    <h3 className="type-section text-lg">Initialise on the contract</h3>
                    <p className="text-muted-foreground">Sets up the tokens, the theme and the lint rule.</p>
                  </div>
                  <Command value={setupCommand} />
                </li>
                <li className={`${PANEL} grid min-w-0 grid-cols-1 content-between gap-6 p-6 sm:p-8`}>
                  <div className="grid content-start gap-2">
                    <h3 className="type-section text-lg">Add a component</h3>
                    <p className="text-muted-foreground">Copied into your project, and yours to edit from then on.</p>
                  </div>
                  <Command value="bunx shadcn@latest add @ja3dan/button --overwrite" />
                </li>
              </ol>
              <Plate
                src={nightCliff}
                alt="Palms leaning out from a dark cliff over deep blue water scattered with light, a figure at the shore"
                focus="object-[center_93%]"
              />
            </div>

            <div className="mt-6">
              <More href="/docs">Read the setup guide</More>
            </div>
          </section>
        </Reveal>

      </main>

      <footer>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
          <p className="type-display text-base text-foreground">groundwork</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/docs" className={`rounded-sm hover:text-foreground ${FOCUS_RING}`}>Docs</Link>
            <Link href="/docs/loop" className={`rounded-sm hover:text-foreground ${FOCUS_RING}`}>The loop</Link>
            <Link href="/docs/tokens" className={`rounded-sm hover:text-foreground ${FOCUS_RING}`}>Tokens</Link>
            <a href="#registry" className={`rounded-sm hover:text-foreground ${FOCUS_RING}`}>Components</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

/**
 * A painting set into the layout. It takes the height of the panels beside it (the grid row
 * stretches it), shares their radius, and on narrow screens becomes a landscape crop above
 * them. `focus` keeps the painting's figure inside whichever crop is showing.
 */
function Plate({ src, alt, focus }: { src: StaticImageData; alt: string; focus: string }) {
  return (
    <figure className="relative aspect-[4/3] min-h-full overflow-hidden rounded-2xl ring-1 ring-foreground/5 ring-inset lg:aspect-auto">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1152px) 544px, (min-width: 1024px) 48vw, 100vw"
        placeholder="blur"
        className={`object-cover ${focus}`}
      />
    </figure>
  );
}

/**
 * One component, on its own stage. The stage is the same height in every block of a row, the
 * component sits in its middle, and the caption row underneath names it. That is the whole
 * anatomy; nothing else goes in a block.
 */
function Block({ name, tier, wide = false, children }: { name: string; tier: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <li className={`${PANEL} grid min-w-0 grid-rows-[1fr_auto] overflow-hidden ${wide ? "sm:col-span-2" : ""}`}>
      <div className="grid min-h-64 place-items-center bg-muted p-6 sm:p-8">{children}</div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-5 py-4">
        <Link
          href={`/docs/components/${name}`}
          className={`min-w-0 rounded-sm font-mono text-sm text-card-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-current ${FOCUS_RING}`}
        >
          {name}
        </Link>
        <span className="text-xs text-subtle-foreground">{tier}</span>
      </div>
    </li>
  );
}

function IndexHeading({ title, count }: { title: string; count: number }) {
  return (
    <h3 className="flex items-baseline gap-2 text-sm font-medium text-foreground">
      {title}
      <span className="font-normal text-subtle-foreground tabular-nums">{count}</span>
    </h3>
  );
}

function IndexList({ names, columns = false }: { names: string[]; columns?: boolean }) {
  return (
    <ul className={columns ? "gap-x-4 sm:columns-2 [&>li]:mb-3" : "grid gap-3"}>
      {names.map((name) => (
        <li key={name}>
          <Link
            href={`/docs/components/${name}`}
            className={`rounded-sm font-mono text-[13px] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-current ${FOCUS_RING}`}
          >
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
