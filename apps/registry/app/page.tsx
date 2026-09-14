import Image from "next/image";
import Link from "next/link";

import background from "@/public/backgrounds/background.webp";

import { LintFailure, SourceBlock } from "./_site/code";
import { SiteHeader } from "./_site/header";
import { CONTEXT_TREE, EVIDENCE, LOOP } from "./_site/kit";
import { Tree } from "./_site/prose";
import { Reveal } from "./_site/reveal";
import { groups, items } from "./_site/registry";
import { FOCUS_RING, TEXT_LINK } from "./_site/styles";

export default function Home() {
  return (
    <>
      <main id="content">
        <section className="relative isolate flex min-h-[92svh] flex-col overflow-hidden">
          <Image
            src={background}
            alt=""
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className="-z-20 object-cover object-center"
          />
          {/*
           * Four layers, each with one job: read the illustration through the page's own
           * ground colour, settle the band behind the header, lift the area behind the words,
           * then dissolve into the page. The percentages were set by looking and then measured
           * against the illustration's pixels in both themes (see the feature log), so
           * re-measure them if the illustration is ever replaced.
           */}
          <div className="absolute inset-0 -z-10 bg-background/46 dark:bg-background/50" />
          <div className="plate-top absolute inset-x-0 top-0 -z-10 h-32" />
          <div className="plate-copy absolute inset-0 -z-10" />
          <div className="plate-fade absolute inset-x-0 bottom-0 -z-10 h-3/5" />

          <SiteHeader variant="plate" />

          {/*
           * The one motion moment: the words settle onto the plate once, on load. Nothing else
           * on the site moves without being asked, and reduced motion collapses it to nothing.
           */}
          <div className="mx-auto flex w-full max-w-4xl flex-1 animate-in flex-col items-center justify-center px-4 pt-32 pb-28 text-center duration-700 ease-out fade-in slide-in-from-bottom-3 sm:px-6">
            <h1 className="type-display text-[clamp(2.5rem,7vw,4.75rem)] text-foreground">
              Your next project starts where the last one finished
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/80">
              Groundwork lays a repo&apos;s foundation before you write any code: the skills and context your agents work
              from, a token contract your components can&apos;t break, and the gotchas you already paid for somewhere
              else.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <Link
                href="/docs"
                className={`rounded-full bg-card px-6 py-3 text-sm font-medium text-card-foreground shadow-border transition-colors hover:bg-accent hover:text-accent-foreground ${FOCUS_RING}`}
              >
                Read the docs
              </Link>
              <a
                href="#registry"
                className={`rounded-full px-5 py-3 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground ${FOCUS_RING}`}
              >
                See the components
              </a>
            </div>
          </div>
        </section>

        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="type-section text-xl text-foreground">Two halves</h2>
            <p className="mt-2 max-w-prose text-muted-foreground">
              Take either on its own. Most projects take both.
            </p>
            <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
              {EVIDENCE.map((half) => (
                /* flex, not grid: `content-start` packs rows to the top and leaves the
                   spare space below them, which gives `mt-auto` nothing to push against —
                   so the two cards' links landed at different heights. */
                <div key={half.title} className="flex flex-col gap-4 bg-card p-6">
                  <div className="grid gap-1.5">
                    <h3 className="type-section text-lg text-card-foreground">{half.title}</h3>
                    <p className="max-w-prose text-sm text-muted-foreground">{half.lead}</p>
                  </div>

                  {half.artefact.kind === "source" ? (
                    <SourceBlock
                      path={half.artefact.path}
                      label={half.artefact.path}
                      content={half.artefact.content}
                      wrap
                    />
                  ) : (
                    <LintFailure
                      path={half.artefact.path}
                      violation={half.artefact.violation}
                      fix={half.artefact.fix}
                      message={half.artefact.message}
                    />
                  )}

                  <p className="font-mono text-xs text-subtle-foreground">{half.facts}</p>

                  <Link href={half.href} className={`mt-auto self-start pt-1 text-sm ${TEXT_LINK}`}>
                    {half.linkLabel}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
              <div className="grid content-start gap-3">
                <h2 className="type-section text-xl text-foreground">Every feature takes the same path</h2>
                <p className="max-w-prose text-muted-foreground">
                  {LOOP.length} steps around a piece of work, most leaving a file behind in the feature&apos;s own folder.
                  The last one refuses to close while any criterion still lacks evidence.
                </p>
                <Link
                  href="/docs/loop"
                  className={`justify-self-start text-sm ${TEXT_LINK}`}
                >
                  Read the loop
                </Link>
              </div>

              <ol className="grid">
                {LOOP.map((stage, index) => (
                  <li
                    key={stage.title}
                    className="grid gap-1 border-b border-border py-4 first:border-t sm:grid-cols-[1.5rem_10rem_minmax(0,1fr)] sm:items-baseline sm:gap-4"
                  >
                    <span className="font-mono text-sm text-subtle-foreground">{index + 1}</span>
                    <span className="font-mono text-sm text-foreground">{stage.command || "build"}</span>
                    <span className="text-sm text-muted-foreground">{stage.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
              <div className="grid content-start gap-3">
                <h2 className="type-section text-xl text-foreground">The architecture exists before the code does</h2>
                <p className="max-w-prose text-muted-foreground">
                  A new repo starts with its overview, its standards and its build plan already written — so the first
                  session begins by reading the project rather than inventing it.
                </p>
                <Link
                  href="/docs/context"
                  className={`justify-self-start text-sm ${TEXT_LINK}`}
                >
                  Read the scaffold
                </Link>
              </div>
              <div className="rounded-md border border-border bg-card p-5">
                <Tree nodes={CONTEXT_TREE} />
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="registry" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-24 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 className="type-section text-xl text-foreground">{items.length} components</h2>
              <p className="text-sm text-muted-foreground">
                Grouped by how finished a thing is, not by what widget it is.
              </p>
            </div>

            <div className="mt-8 grid gap-10">
              {groups.map((group) => (
                <div key={group.tier} id={group.tier} className="scroll-mt-20">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-2">
                    <h3 className="type-section text-base text-foreground">{group.title}</h3>
                    <p className="text-sm text-muted-foreground">{group.blurb}</p>
                  </div>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={`/docs/components/${item.name}`}
                          className={`grid gap-0.5 border-b border-border py-3 transition-colors hover:bg-accent/60 sm:grid-cols-[13rem_minmax(0,1fr)_4rem] sm:items-baseline sm:gap-6 sm:px-2 ${FOCUS_RING}`}
                        >
                          <span className="font-mono text-sm text-foreground">{item.name}</span>
                          <span className="text-sm text-muted-foreground">{item.description}</span>
                          <span className="font-mono text-xs tabular-nums text-subtle-foreground sm:text-end">{item.version}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <p className="type-display text-base text-foreground">groundwork</p>
          <p className="text-sm text-subtle-foreground">
            The skills, the context and the design system a new repo starts with.
          </p>
        </div>
      </footer>
    </>
  );
}
