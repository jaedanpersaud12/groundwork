import { cn } from "@/lib/utils";

import { CODE_FRAME, CODE_HEAD, CODE_META, CODE_TEXT, CODE_TITLE } from "./code";
import { CopyButton } from "./copy-button";
import { highlight, langFor, type Lang } from "./highlight";

/**
 * Code with its name and a copy button, highlighted on the server. The language defaults to
 * whatever the title's extension implies. Long blocks scroll inside the frame (`tall`) rather
 * than pushing the page down; `wrap` breaks long lines instead of scrolling them.
 */
async function CodeBlock({
  title,
  code,
  lang,
  meta,
  lineNumbers = false,
  tall = false,
  wrap = false,
}: {
  title: string;
  code: string;
  lang?: Lang;
  meta?: string;
  lineNumbers?: boolean;
  tall?: boolean;
  wrap?: boolean;
}) {
  const html = await highlight(code, lang ?? langFor(title));
  return (
    <figure className={CODE_FRAME}>
      <figcaption className={CODE_HEAD}>
        <span className={CODE_TITLE}>{title}</span>
        {meta ? <span className={CODE_META}>{meta}</span> : null}
        <CopyButton value={code} label={title} />
      </figcaption>
      <pre
        data-line-numbers={lineNumbers ? "" : undefined}
        className={cn(
          "syntax scroll-slim overflow-auto px-4 py-3",
          CODE_TEXT,
          tall && "max-h-120",
          wrap && "break-words whitespace-pre-wrap",
        )}
      >
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </figure>
  );
}

/** A real file from the repo or the registry, shown whole: numbered, highlighted, scrollable. */
async function SourceBlock({ path, content, label }: { path: string; content: string; label?: string }) {
  const file = label ?? path.split("/").pop() ?? path;
  const lines = content.split("\n").length;
  return <CodeBlock title={file} code={content} lang={langFor(path)} meta={`${lines} lines`} lineNumbers tall />;
}

export { CodeBlock, SourceBlock };
