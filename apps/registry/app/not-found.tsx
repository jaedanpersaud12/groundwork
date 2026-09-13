import Link from "next/link";

import { SiteHeader } from "./_site/header";
import { TEXT_LINK } from "./_site/styles";

/**
 * Mostly reached by a component URL that was renamed or never existed. Keeping the header
 * means the reader still has the whole site one click away rather than a bare error.
 */
export default function NotFound() {
  return (
    <div className="min-h-svh">
      <SiteHeader variant="solid" />
      <main id="content" className="mx-auto grid w-full max-w-6xl content-start gap-4 px-4 py-24 sm:px-6">
        <p className="font-mono text-sm text-subtle-foreground">404</p>
        <h1 className="type-display text-4xl text-foreground">Nothing here</h1>
        <p className="max-w-prose text-muted-foreground">
          If you followed a link to a component, it may have been renamed — every item is listed on{" "}
          <Link href="/#registry" className={TEXT_LINK}>
            the home page
          </Link>
          . Otherwise,{" "}
          <Link href="/docs" className={TEXT_LINK}>
            start here
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
