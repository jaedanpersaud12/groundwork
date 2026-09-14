import { createCssVariablesTheme, createHighlighter, type BundledLanguage, type Highlighter } from "shiki";

/**
 * Syntax highlighting, done on the server at build time, so no highlighter ships to the
 * browser. Shiki's css-variables theme writes `var(--shiki-token-*)` instead of colours;
 * globals.css points those at contract tokens, so highlighting follows the theme toggle and
 * never introduces a colour the contract doesn't have.
 */
const theme = createCssVariablesTheme({ name: "groundwork", variablePrefix: "--shiki-" });

const LANGS = ["bash", "tsx", "ts", "js", "css", "json", "markdown"] as const satisfies readonly BundledLanguage[];
type Lang = (typeof LANGS)[number];

let highlighter: Promise<Highlighter> | null = null;

function load(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: [theme], langs: [...LANGS] });
  return highlighter;
}

/** The language a file name implies, for blocks that show a real file. */
function langFor(file: string): Lang {
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, Lang> = { tsx: "tsx", ts: "ts", mjs: "js", js: "js", jsx: "tsx", css: "css", json: "json", md: "markdown", sh: "bash" };
  return map[ext] ?? "markdown";
}

/** Highlighted lines as HTML: the `<span class="line">` run from inside Shiki's `<code>`. */
async function highlight(code: string, lang: Lang): Promise<string> {
  const html = (await load()).codeToHtml(code, { lang, theme: "groundwork" });
  const inner = /<code>([\s\S]*)<\/code>/.exec(html)?.[1];
  if (inner === undefined) throw new Error("Shiki's output no longer wraps its lines in <code>.");
  return inner;
}

export { highlight, langFor, type Lang };
