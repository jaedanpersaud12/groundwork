import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import plugin from "@ja3dan/eslint-plugin";

/**
 * Reads the agent kit straight out of the repo at build time. The docs describe what
 * `skills/`, `knowledge/` and `context/` actually contain, so a skill rewritten or a
 * gotcha harvested shows up on the next deploy without anyone remembering to edit a page.
 *
 * `process.cwd()` is `apps/registry` under both `next dev` and `next build`, which is why
 * the root is two levels up rather than resolved from this file.
 *
 * Read once per module load. `next dev` doesn't watch files outside `apps/registry`, so a new
 * knowledge file or skill shows up after a dev-server restart; `next build` always reads fresh.
 */
const ROOT = path.join(process.cwd(), "..", "..");

function read(...segments: string[]): string {
  return readFileSync(path.join(ROOT, ...segments), "utf8");
}

/** Flat `key: value` frontmatter. Enough for SKILL.md and knowledge files; not YAML. */
function frontmatter(text: string): { data: Record<string, string>; raw: string; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { data: {}, raw: "", body: text };
  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const pair = /^([\w-]+):\s*(.*?)(\s+#.*)?$/.exec(line);
    if (pair) data[pair[1]] = pair[2];
  }
  return { data, raw: match[0].trim(), body: text.slice(match[0].length) };
}

type Skill = { name: string; description: string; body: string };

function skillNames(): string[] {
  return readdirSync(path.join(ROOT, "skills"))
    .filter((entry) => statSync(path.join(ROOT, "skills", entry)).isDirectory())
    .sort();
}

function readSkill(name: string): Skill {
  const { data, body } = frontmatter(read("skills", name, "SKILL.md"));
  if (!data.description) throw new Error(`skills/${name}/SKILL.md has no description in its frontmatter.`);
  return { name, description: data.description, body };
}

/**
 * The first paragraph under a `## heading` of a skill, for the one skill that is two steps
 * of the loop. Throws rather than rendering nothing, so a renamed heading fails the build
 * instead of leaving a blank row on the site.
 */
function skillSection(skill: Skill, heading: string): string {
  const start = skill.body.indexOf(`## ${heading}`);
  if (start === -1) throw new Error(`skills/${skill.name}/SKILL.md has no "## ${heading}" section.`);
  const after = skill.body.slice(start).split("\n").slice(1).join("\n").trim();
  return after.split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, " ");
}

type FeatureFile = { name: string; note: string; by: string };

/**
 * The feature folder's shape, parsed from the tree drawn in `context/features/README.md` —
 * the same drawing `/feature start` points people at, so the site and the scaffold agree.
 */
function featureFolder(): FeatureFile[] {
  const block = /```\n([\s\S]*?)```/.exec(read("context", "features", "README.md"));
  if (!block) throw new Error("context/features/README.md has no fenced tree to read the feature folder from.");
  return block[1]
    .split("\n")
    .map((line) => /^\s+(\S+\.md)\s+(.+?)\s+\((.+)\)\s*$/.exec(line))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => ({ name: match[1], note: match[2], by: match[3] }));
}

type FeatureRecord = { id: string; slug: string; title: string; files: string[] };

/**
 * This repo's own feature folders, as the landing page shows them: the number, the slug, the
 * spec's own heading cut to its short name, and which loop files the folder actually holds.
 * The page's hero table is these rows, so what it shows is what `context/features/` holds.
 */
function featureFolders(): FeatureRecord[] {
  const root = path.join(ROOT, "context", "features");
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
    .map((dir) => {
      const files = readdirSync(path.join(root, dir)).filter((file) => file.endsWith(".md"));
      const heading = /^#\s+(.+)$/m.exec(read("context", "features", dir, "spec.md"))?.[1] ?? dir;
      const title = heading
        .replace(/^\d{2}\s*(\u2014\s*)?/, "")
        .split(" \u2014 ")[0]
        .replace(/`/g, "")
        .trim();
      return { id: dir.slice(0, 2), slug: dir.slice(3), title, files };
    });
}

/**
 * The lock file `kit init` writes, read from the kit's own source so the landing page names
 * the file the command really produces.
 */
function kitLockFile(): string {
  const name = /const LOCK_FILE = "([^"]+)"/.exec(read("packages", "kit", "src", "lockfile.ts"))?.[1];
  if (!name) throw new Error("packages/kit/src/lockfile.ts no longer declares LOCK_FILE.");
  return name;
}

/**
 * The two lines `kit init` adds to eslint.config.mjs, read out of init.ts so the docs show
 * what the command really writes. Throws if either stops being findable.
 */
function kitEslintWiring(): { importLine: string; entry: string } {
  const source = read("packages", "kit", "src", "commands", "init.ts");
  const importLine = /`\$\{content\.slice\(0, importEnd\)\}(import [^\\`]+?);\\n/.exec(source)?.[1];
  const entry = /const entry = '\s*(\{[^']+\}),\\n';/.exec(source)?.[1];
  if (!importLine || !entry) throw new Error("packages/kit/src/commands/init.ts no longer writes the eslint wiring the docs quote.");
  return { importLine, entry: `${entry},` };
}

/** One command's description from the kit CLI's own usage text, e.g. "sync status". */
function kitUsage(command: string): string {
  const usage = read("packages", "kit", "src", "cli.ts");
  const line = usage.split("\n").find((row) => row.trimStart().startsWith(`kit ${command}`));
  const description = line?.replace(/^\s*kit \S+(?: \S+)*?\s{2,}/, "").trim();
  if (!description) throw new Error(`packages/kit/src/cli.ts usage no longer describes "kit ${command}".`);
  return description;
}

/** The themes the contract ships, read off disk — never counted by hand. */
function themeNames(): string[] {
  return readdirSync(path.join(ROOT, "packages", "tokens", "themes"))
    .filter((entry) => entry.endsWith(".css"))
    .map((entry) => entry.replace(/\.css$/, ""))
    .sort();
}

function contextFiles(): string[] {
  return readdirSync(path.join(ROOT, "context"))
    .filter((entry) => entry.endsWith(".md"))
    .sort();
}

type PromptFile = { file: string; title: string; content: string };

/** The kickoff prompts, in run order (the filename numbers), with their own `# Title` as the label. */
function promptFiles(): PromptFile[] {
  return readdirSync(path.join(ROOT, "prompts"))
    .filter((entry) => entry.endsWith(".md"))
    .sort()
    .map((file) => {
      const content = read("prompts", file);
      const title = /^#\s+(.+)$/m.exec(content)?.[1] ?? file;
      return { file, title, content };
    });
}

/** Every file the `next16-insforge` template copies into a new project, relative to its own root. */
function templateFiles(preset: string): string[] {
  const root = path.join(ROOT, "templates", preset);
  const walk = (dir: string): string[] =>
    readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
      const rel = dir ? `${dir}/${entry.name}` : entry.name;
      return entry.isDirectory() ? walk(rel) : [rel];
    });
  return walk("").sort();
}

type KnowledgeFile = {
  file: string;
  title: string;
  scope: string;
  stack: string[];
  verifiedVersion: string;
  verifiedOn: string;
  gotchas: number;
  frontmatter: string;
};

function knowledgeFiles(): KnowledgeFile[] {
  return readdirSync(path.join(ROOT, "knowledge"))
    .filter((entry) => entry.endsWith(".md") && entry !== "README.md")
    .sort()
    .map((file) => {
      const { data, raw, body } = frontmatter(read("knowledge", file));
      return {
        file,
        title: /^#\s+(.+)$/m.exec(body)?.[1] ?? file,
        scope: data.scope ?? "",
        stack: (data.stack ?? "")
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
        verifiedVersion: data.verified_version ?? "",
        verifiedOn: data.verified_on ?? "",
        gotchas: body.split("\n").filter((line) => /^- \*\*/.test(line)).length,
        frontmatter: raw,
      };
    });
}

/**
 * The `no-raw-colors` messages, read off the rule's own metadata rather than copied. A
 * reworded message reaches the site on the next build; a renamed rule throws here instead
 * of leaving a stale quotation on the landing page, which is the one thing that section
 * is there to disprove.
 */
function lintMessages(): Record<string, string> {
  const rule = plugin.rules?.["no-raw-colors"];
  if (!rule?.meta?.messages) {
    throw new Error("@ja3dan/eslint-plugin no longer exposes no-raw-colors meta.messages.");
  }
  return rule.meta.messages as Record<string, string>;
}

/** One message with its `{{placeholder}}`s filled in, so the page shows what a developer sees. */
function lintMessage(id: string, values: Record<string, string>): string {
  const template = lintMessages()[id];
  if (!template) throw new Error(`@ja3dan/eslint-plugin has no "${id}" message.`);
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`The "${id}" message needs a ${key} value.`);
    return values[key];
  });
}

/** The opening lines of a skill's SKILL.md, verbatim, for a view that crops the rest. */
function skillExcerpt(name: string, lines: number): string {
  return read("skills", name, "SKILL.md").split("\n").slice(0, lines).join("\n");
}

/** A skill's frontmatter block, verbatim — the `---` fences included. */
function skillFrontmatter(name: string): string {
  const { raw } = frontmatter(read("skills", name, "SKILL.md"));
  if (!raw) throw new Error(`skills/${name}/SKILL.md has no frontmatter block.`);
  return raw;
}

export {
  contextFiles,
  featureFolder,
  featureFolders,
  kitEslintWiring,
  kitLockFile,
  kitUsage,
  knowledgeFiles,
  lintMessage,
  promptFiles,
  readSkill,
  skillExcerpt,
  skillFrontmatter,
  skillNames,
  skillSection,
  templateFiles,
  themeNames,
  type FeatureFile,
  type FeatureRecord,
  type KnowledgeFile,
  type PromptFile,
  type Skill,
};
