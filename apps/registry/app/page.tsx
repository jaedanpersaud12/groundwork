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
import { EVIDENCE, KICKOFF, KIT_INIT, LOOP, PROJECT_STEPS, PROJECT_TREE, STATS } from "./_site/kit";
import { FeatureTable } from "./_site/landing/feature-table";
import { ProjectSteps } from "./_site/landing/project-steps";
import { FilterChipDemo, ViewToggleDemo } from "./_site/landing/specimen";
import { Tagline } from "./_site/landing/tagline";
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
 *   sentence, then 48px to the content.
 * Surfaces. A panel is the contract's raised surface (`bg-card shadow-border`), the same one
 *   the registry's own TableCard uses. Code inside a panel sits on `bg-muted`.
 * Rows. Panels side by side share their rows through `grid-rows-subgrid`, so titles,
 *   artefacts and links line up across the pair however long either one's copy runs.
 * Spacing. 8px inside a group, 24px between groups in a panel, 16px between panels,
 *   48px from a section's opening to its content, 96-128px between sections (2x that).
 *   Only values from the spacing table (0 2 4 8 12 16 24 32 40 48 64 80 96px) and
 *   Tailwind's type scale; no arbitrary sizes.
 */

const PANEL = "rounded-2xl bg-card text-card-foreground shadow-border";

const [KIT, DESIGN] = EVIDENCE;



function SectionHead({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="grid max-w-2xl gap-3">
      <h2 className="type-display text-3xl lg:text-4xl text-foreground">{title}</h2>
      <p className="text-lg text-pretty text-muted-foreground">{lead}</p>
    </div>
  );
}

function More({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className={`inline-flex shrink-0 items-center gap-2 text-sm ${TEXT_LINK}`}>
      {children}
      <ArrowRightIcon aria-hidden className="size-3.5 rtl:-scale-x-100" />
    </Link>
  );
}

export default function Home() {
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
        <section className="mx-auto w-full max-w-6xl px-4 pt-16 pb-12 sm:px-6 lg:pt-24 lg:pb-16">
          {/*
            * Capped at 680px and broken after "last", where the thought turns. The gradient is
            * the contract's own foreground into muted-foreground, left to right, so it follows
            * the theme; `pb-2` keeps the descenders inside the clipped background.
            */}
          <h1 className="max-w-[680px] animate-in bg-linear-to-r from-foreground to-muted-foreground bg-clip-text pb-2 type-display text-5xl text-transparent duration-700 ease-fluid fade-in slide-in-from-bottom-3 sm:text-6xl">
            Start where the last <br className="hidden sm:block" />
            project finished.
          </h1>
          <div className="mt-12 grid animate-in grid-cols-1 gap-6 delay-100 duration-700 ease-fluid fade-in lg:grid-cols-2 lg:items-end lg:gap-4">
            <p className="max-w-[680px] text-lg text-pretty text-muted-foreground lg:max-w-md">
              Agent skills, project context and a token contract, in your repo before the first line of code.
            </p>
            <div className="grid min-w-0 grid-cols-1 gap-2">
              <Command value={KIT_INIT.command} />
              <a href="#registry" className={`inline-flex items-center gap-2 justify-self-start text-sm ${TEXT_LINK}`}>
                Browse components
                <ArrowRightIcon aria-hidden className="size-3.5 rtl:-scale-x-100" />
              </a>
            </div>
          </div>
        </section>

        <div className="relative h-[clamp(16rem,40vw,34rem)] w-full animate-in overflow-hidden delay-200 duration-1000 ease-fluid fade-in">
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
          <section className="mx-auto w-full max-w-6xl px-4 pt-20 pb-12 sm:px-6 lg:pt-24 lg:pb-16">
            <SectionHead title="Two halves" lead="Take either one on its own. Most projects take both." />

            {/*
              * One object, split at a seam, not two cards: the halves share one frame and one
              * surface, divided by a single line. Each half opens a window onto a real file that
              * runs off the half's bottom and trailing edges, so it reads as a view into the file
              * rather than a boxed quotation of it.
              */}
            <div className={`${PANEL} relative mt-12 grid grid-cols-1 overflow-hidden lg:grid-cols-2 lg:grid-rows-[auto_1fr]`}>
              <article className="grid min-w-0 grid-rows-[auto_1fr] gap-8 bg-card pt-8 sm:pt-10 lg:row-span-2 lg:grid-rows-subgrid">
                <HalfHead title={KIT.title} href={KIT.href} link={KIT.linkLabel}>
                  {STATS.skills} skills your agents run, and the context they read before they touch code.
                </HalfHead>
                <Window path={KIT.artefact.kind === "source" ? KIT.artefact.path : ""}>
                  {(KIT.artefact.kind === "source" ? KIT.artefact.excerpt : "").split("\n").map((line, index) => (
                    <span key={index} className="grid grid-cols-[2rem_minmax(0,1fr)]">
                      <span aria-hidden className="text-subtle-foreground tabular-nums select-none">
                        {index + 1}
                      </span>
                      <span className="whitespace-pre text-foreground">{line || " "}</span>
                    </span>
                  ))}
                </Window>
              </article>

              <article className="grid min-w-0 grid-rows-[auto_1fr] gap-8 border-t border-border bg-card pt-8 sm:pt-10 lg:row-span-2 lg:grid-rows-subgrid lg:border-t-0 lg:border-s">
                <HalfHead title={DESIGN.title} href={DESIGN.href} link={DESIGN.linkLabel}>
                  {STATS.tokens} tokens in one contract, and a lint rule that fails anything outside it.
                </HalfHead>
                {lint ? (
                  <Window path={lint.path}>
                    <span className="block whitespace-pre text-muted-foreground">
                      <span className="sr-only">Fails: </span>
                      {before}
                      <span className="text-foreground underline decoration-destructive decoration-wavy decoration-1 underline-offset-4">
                        {lint.offending}
                      </span>
                      {after}
                    </span>
                    <span className="mt-2 block whitespace-pre-wrap text-destructive">
                      <span aria-hidden>✕ </span>
                      {lint.message}
                    </span>
                    <span className="mt-6 block whitespace-pre text-success">
                      <span className="sr-only">Passes: </span>
                      {lint.fix}
                    </span>
                    <span className="mt-2 block text-subtle-foreground">
                      <span aria-hidden>✓ </span>no problems
                    </span>
                  </Window>
                ) : null}
              </article>
            </div>
          </section>
        </Reveal>

        {/* The statement, on its own: why the whole thing exists. */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Tagline lines={["Every project you finish", "makes the next one", "cheaper to start."]} />
        </section>

        {/* How a project starts: the kit installs, then kickoff writes the project's own context. */}
        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
            <SectionHead
              title="How a project starts"
              lead="An empty repo, three steps, and every file each one leaves behind."
            />

            <div className="mt-12">
              <ProjectSteps
                steps={PROJECT_STEPS}
                tree={PROJECT_TREE}
                prompts={KICKOFF.map((entry) => entry.prompt)}
              />
            </div>
          </section>
        </Reveal>

        {/* The loop: one panel, five columns, the same three rows in each. */}
        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
            <SectionHead
              title="Then every feature takes the same path"
              lead="Most steps leave a file in the feature's folder. The last one will not close while a criterion lacks evidence."
            />

            <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Plate
                src={nightCove}
                alt="A figure walking a moonlit cove, palms silhouetted in blue with gold edges"
                focus="object-[center_30%]"
              />
              <ol className={`${PANEL} grid min-w-0 divide-y divide-border`}>
                {LOOP.map((stage) => (
                  <li key={stage.title} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 px-6 py-4 sm:px-8">
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
          <section id="registry" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 lg:py-16">
            <SectionHead
              title={`${items.length} components, yours to edit`}
              lead="Copied in by shadcn and versioned, so a later update can merge with your edits."
            />

            <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <section id="start" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 lg:py-16">
            <SectionHead title="Start a project" lead="The whole kit in one command, or the design system on its own." />

            <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ol className="grid min-w-0 grid-cols-1 gap-4">
                <li className={`${PANEL} grid min-w-0 grid-cols-1 content-between gap-6 p-6 sm:p-8`}>
                  <div className="grid content-start gap-2">
                    <h3 className="type-section text-lg">The whole kit</h3>
                    <p className="text-muted-foreground">Skills, context and the design system, installed and locked.</p>
                  </div>
                  <Command value={KIT_INIT.command} />
                </li>
                <li className={`${PANEL} grid min-w-0 grid-cols-1 content-between gap-6 p-6 sm:p-8`}>
                  <div className="grid content-start gap-2">
                    <h3 className="type-section text-lg">Only the design system</h3>
                    <p className="text-muted-foreground">The tokens, the theme and the lint rule, through shadcn.</p>
                  </div>
                  <Command value={setupCommand} />
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
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-6 py-4">
        <Link
          href={`/docs/components/${name}`}
          className={`min-w-0 rounded-sm font-mono text-sm text-card-foreground underline decoration-border underline-offset-4 transition-colors duration-300 ease-fluid hover:decoration-current ${FOCUS_RING}`}
        >
          {name}
        </Link>
        <span className="text-xs text-subtle-foreground">{tier}</span>
      </div>
    </li>
  );
}

/** A half's heading row: the title with its link on the same line, then one sentence. */
function HalfHead({ title, href, link, children }: { title: string; href: string; link: string; children: React.ReactNode }) {
  return (
    <div className="grid content-start gap-3 px-6 sm:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="type-display text-2xl text-foreground sm:text-3xl">{title}</h3>
        <More href={href}>{link}</More>
      </div>
      <p className="max-w-md text-pretty text-muted-foreground">{children}</p>
    </div>
  );
}

/**
 * A window onto a file. It starts inset from the leading edge and runs off the bottom and
 * trailing edges of its half, which crops it, so only its top leading corner is rounded.
 */
function Window({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <figure
      className="ms-6 grid h-72 min-w-0 grid-rows-[auto_1fr] overflow-hidden rounded-ss-xl bg-muted shadow-border sm:ms-10 lg:h-80"
    >
      <figcaption className="border-b border-border px-4 py-3 font-mono text-xs text-muted-foreground">{path}</figcaption>
      <code className="block overflow-hidden p-4 font-mono text-xs leading-6">{children}</code>
    </figure>
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
            className={`rounded-sm font-mono text-xs text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-300 ease-fluid hover:text-foreground hover:decoration-current ${FOCUS_RING}`}
          >
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
