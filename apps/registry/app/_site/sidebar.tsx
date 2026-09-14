"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";
import { CELL, EASE, ROLL, STILL, TURN } from "@/registry/groundwork/lib/motion";

import { FOCUS_RING } from "./styles";

type SidebarSection = { title: string; items: { href: string; label: string }[] };

/*
 * Motion, all from @ja3dan/motion so the sidebar moves like the components it documents.
 * A group opens on the house ease-out and shuts faster than it opens: the reader asked for
 * the list and watches it arrive, but nobody watches a list leave. Rows follow the opening
 * height a beat apart, close enough that they read as one gesture rather than a cascade.
 */
const OPEN = { height: { duration: 0.26, ease: EASE }, opacity: ROLL } as const;
const SHUT = { height: { duration: 0.18, ease: EASE }, opacity: { duration: 0.12, ease: EASE } } as const;

const list: Variants = {
  shut: { height: 0, opacity: 0, transition: SHUT },
  open: { height: "auto", opacity: 1, transition: OPEN },
};

/* Reduced motion keeps the fade that says something changed and drops the travel. */
const still: Variants = {
  shut: { opacity: 0, transition: STILL },
  open: { opacity: 1, transition: STILL },
};

const rows: Variants = {
  shut: { opacity: 0, transform: "translateY(-4px)" },
  open: (index: number) => ({
    opacity: 1,
    transform: "translateY(0px)",
    transition: { ...ROLL, delay: 0.03 + index * 0.02 },
  }),
};

/* Rows are one fixed height so the rail can travel in whole rows (`translateY(n * 100%)`). */
const ROW = "h-8";

/* The rings sit inside the row: the groups clip their overflow while they animate. */
const RING = `${FOCUS_RING} focus-visible:ring-inset`;

function Chevron({ open }: { open: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 12 12"
      width="12"
      height="12"
      focusable="false"
      initial={false}
      animate={{ rotate: open ? 90 : 0 }}
      transition={reduced ? STILL : TURN}
      className="shrink-0 text-subtle-foreground rtl:-scale-x-100"
    >
      <path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

function Group({
  section,
  pathname,
  open,
  onToggle,
  onNavigate,
}: {
  section: SidebarSection;
  pathname: string;
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const reduced = useReducedMotion();
  const listId = useId();
  const active = section.items.findIndex((item) => item.href === pathname);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={onToggle}
        className={cn(
          ROW,
          "group flex w-full items-center gap-2 rounded-md px-2 text-start text-sm font-medium text-foreground",
          "transition-transform duration-150 ease-out active:scale-[0.98]",
          RING,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{section.title}</span>
        {/* The count only earns its place while the list is out of sight. */}
        <span
          className={cn(
            "text-xs text-subtle-foreground tabular-nums transition-opacity duration-150",
            open ? "opacity-0" : "opacity-100",
          )}
        >
          {section.items.length}
        </span>
        <Chevron open={open} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="list"
            id={listId}
            variants={reduced ? still : list}
            initial="shut"
            animate="open"
            exit="shut"
            className="overflow-hidden"
          >
            <ul className="relative ms-2 mt-0.5 mb-3 border-s border-border ps-2">
              {/* One rail per group, sliding a row at a time as the reader moves through it. */}
              {active >= 0 ? (
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ transform: `translateY(${active * 100}%)` }}
                  transition={reduced ? STILL : CELL}
                  className={cn(ROW, "absolute -start-[1.5px] top-0 flex w-0.5 items-center")}
                >
                  <span className="h-4 w-0.5 rounded-full bg-primary" />
                </motion.span>
              ) : null}

              {section.items.map((item, index) => {
                const current = index === active;
                return (
                  <motion.li key={item.href} custom={index} variants={reduced ? undefined : rows}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        ROW,
                        "flex items-center truncate rounded-md px-2 text-sm transition-colors duration-150 ease-out",
                        RING,
                        current ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Which groups start open: the kit's own pages, which most readers come for, and whichever
 * group holds the page being read. The component tiers stay folded to their counts until
 * asked for, so the column stays a table of contents instead of a wall of forty links.
 */
function initialOpen(sections: SidebarSection[], pathname: string) {
  return new Set(
    sections
      .filter((section, index) => index < 2 || section.items.some((item) => item.href === pathname))
      .map((section) => section.title),
  );
}

function Groups({
  sections,
  pathname,
  onNavigate,
}: {
  sections: SidebarSection[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(() => initialOpen(sections, pathname));
  const [seen, setSeen] = useState(pathname);

  /* Arriving on a page from a link in the page itself opens its group, so the rail is never hidden. */
  if (seen !== pathname) {
    setSeen(pathname);
    const home = sections.find((section) => section.items.some((item) => item.href === pathname));
    if (home && !open.has(home.title)) setOpen(new Set(open).add(home.title));
  }

  const toggle = (title: string) =>
    setOpen((previous) => {
      const next = new Set(previous);
      if (!next.delete(title)) next.add(title);
      return next;
    });

  return (
    <div className="grid gap-1">
      {sections.map((section) => (
        <Group
          key={section.title}
          section={section}
          pathname={pathname}
          open={open.has(section.title)}
          onToggle={() => toggle(section.title)}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function Sidebar({ sections }: { sections: SidebarSection[] }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const column = useRef<HTMLElement>(null);
  const [folded, setFolded] = useState(true);
  const panelId = useId();

  const current = sections.flatMap((section) => section.items).find((item) => item.href === pathname);

  /* A deep link into a tier lands with its row in view, not forty rows below the fold. */
  useEffect(() => {
    column.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, []);

  useEffect(() => {
    if (folded) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setFolded(true);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [folded]);

  return (
    <>
      {/* Wide: a column that stays put while the page scrolls. */}
      <nav
        ref={column}
        aria-label="Documentation"
        className="scroll-slim sticky top-20 -mx-2 hidden max-h-[calc(100svh-6rem)] self-start overflow-y-auto pb-12 lg:block"
      >
        <Groups sections={sections} pathname={pathname} />
      </nav>

      {/*
       * Narrow: the same groups behind one bar that names the page you're on. It shuts on the
       * link's click rather than on the pathname change: by the time the pathname changes,
       * Next has already scrolled to where the page started under the open panel, and
       * shutting it then leaves the reader thirty links down the page.
       */}
      <div className="rounded-lg bg-card text-card-foreground shadow-border lg:hidden">
        <button
          type="button"
          aria-expanded={!folded}
          aria-controls={panelId}
          onClick={() => setFolded((value) => !value)}
          className={cn("flex h-11 w-full items-center gap-2 rounded-lg px-4 text-start text-sm", FOCUS_RING)}
        >
          <span className="text-muted-foreground">Docs</span>
          <span aria-hidden className="text-subtle-foreground">
            /
          </span>
          <span className="min-w-0 flex-1 truncate font-medium">{current?.label ?? "Browse"}</span>
          <Chevron open={!folded} />
        </button>

        <AnimatePresence initial={false}>
          {folded ? null : (
            <motion.nav
              key="panel"
              id={panelId}
              aria-label="Documentation"
              variants={reduced ? still : list}
              initial="shut"
              animate="open"
              exit="shut"
              className="overflow-hidden"
            >
              <div className="border-t border-border p-2">
                <Groups sections={sections} pathname={pathname} onNavigate={() => setFolded(true)} />
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export { Sidebar, type SidebarSection };
