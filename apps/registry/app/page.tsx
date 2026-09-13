import registry from "@/registry.json";
import versions from "@/public/r/versions.json";

import { Examples } from "./examples";
import { ThemeToggle } from "./theme-toggle";

type RegistryItem = (typeof registry.items)[number];

const published = versions as Record<string, { version: string }>;

const GROUPS: { tier: string; title: string; blurb: string }[] = [
  { tier: "block", title: "Blocks", blurb: "Composed, working sections. Install, then replace the sample data." },
  { tier: "pattern", title: "Patterns", blurb: "Interactive pieces built from primitives." },
  { tier: "primitive", title: "Primitives", blurb: "The base controls every pattern is built from." },
  { tier: "hook", title: "Hooks", blurb: "State without markup." },
  { tier: "lib", title: "Libraries", blurb: "Shared helpers other items depend on." },
];

function Install({ command }: { command: string }) {
  return (
    <code className="block overflow-x-auto rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs whitespace-nowrap text-foreground">
      {command}
    </code>
  );
}

function ItemSection({ item }: { item: RegistryItem }) {
  const dependsOn = "registryDependencies" in item ? (item.registryDependencies as string[]) : [];
  return (
    <section id={item.name} className="grid scroll-mt-6 gap-5 border-t border-border py-10">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_22rem] md:items-start md:gap-10">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
            <span className="font-mono text-xs text-subtle-foreground">
              @ja3dan/{item.name} · v{published[item.name]?.version} · tracks {item.meta.track}
            </span>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">{item.description}</p>
          {dependsOn.length ? (
            <p className="text-xs text-subtle-foreground">Also installs {dependsOn.join(", ")}</p>
          ) : null}
        </div>
        <Install command={`bunx shadcn@latest add @ja3dan/${item.name}`} />
      </div>
      <Examples name={item.name} fallback="No visual preview. See the blocks and patterns that use it." />
    </section>
  );
}

export default function Home() {
  const [setup, ...items] = registry.items;
  const groups = GROUPS.map((group) => ({ ...group, items: items.filter((item) => item.meta.tier === group.tier) }));

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[12rem_minmax(0,1fr)]">
      <nav aria-label="Registry items" className="hidden lg:block">
        <div className="sticky top-12 grid gap-6">
          <ThemeToggle />
          {groups.map((group) => (
            <div key={group.tier} className="grid gap-2">
              <p className="font-mono text-xs tracking-wide text-subtle-foreground uppercase">{group.title}</p>
              <ul className="grid gap-1">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <a href={`#${item.name}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <main className="min-w-0">
        <header className="flex flex-wrap items-start justify-between gap-6 pb-10">
          <div className="grid max-w-xl gap-2">
            <p className="font-mono text-xs tracking-wide text-subtle-foreground uppercase">ja3dan registry</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Shared components and tokens</h1>
            <p className="text-muted-foreground">
              Components are copied into your project, so you can still edit them. Tokens and lint rules come from npm.
              Every component uses only the token contract, so it takes on each project&apos;s theme.
            </p>
          </div>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </header>

        <section className="grid gap-4 rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-card-foreground">Set up a project</h2>
          <ol className="grid list-decimal gap-3 pl-5 text-sm text-muted-foreground">
            <li className="space-y-2">
              <span>Initialise with the setup item. {setup.description}</span>
              <Install command="bunx shadcn@latest init https://<registry-domain>/r/setup.json" />
            </li>
            <li className="space-y-2">
              <span>Replace shadcn&apos;s default button, then add anything below.</span>
              <Install command="bunx shadcn@latest add @ja3dan/button --overwrite" />
            </li>
          </ol>
        </section>

        {groups.map((group) =>
          group.items.length ? (
            <div key={group.tier} className="mt-14">
              <div className="grid gap-1 pb-2">
                <h2 className="text-xl font-semibold text-foreground">{group.title}</h2>
                <p className="text-sm text-muted-foreground">{group.blurb}</p>
              </div>
              {group.items.map((item) => (
                <ItemSection key={item.name} item={item} />
              ))}
            </div>
          ) : null,
        )}
      </main>
    </div>
  );
}
