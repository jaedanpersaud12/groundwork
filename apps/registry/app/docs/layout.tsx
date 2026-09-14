import { SiteHeader } from "../_site/header";
import { groups } from "../_site/registry";
import { Sidebar, type SidebarSection } from "../_site/sidebar";

const sections: SidebarSection[] = [
  {
    title: "The kit",
    items: [
      { href: "/docs", label: "Start here" },
      { href: "/docs/loop", label: "The loop" },
      { href: "/docs/context", label: "Context" },
      { href: "/docs/knowledge", label: "Knowledge" },
      { href: "/docs/kickoff", label: "Kickoff" },
    ],
  },
  {
    title: "Design system",
    items: [{ href: "/docs/tokens", label: "Token contract" }],
  },
  ...groups.map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({ href: `/docs/components/${item.name}`, label: item.title })),
  })),
];

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="min-h-svh">
      <SiteHeader variant="solid" />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:py-12">
        <Sidebar sections={sections} />
        <main id="content" className="min-w-0 scroll-mt-20">
          {children}
        </main>
      </div>
    </div>
  );
}
