import contract from "@ja3dan/tokens/contract.json";

import {
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
} from "./repo";

/**
 * The agent-kit half of groundwork, as the site describes it. The words come from the
 * repo — each skill's own description, the feature folder drawn in
 * `context/features/README.md` — and this file supplies only the order and the headings.
 *
 * Every skill in `skills/` has to appear in the loop or out of band, and every file in
 * `context/` needs a note. Either mismatch fails the build, so the site cannot quietly fall
 * behind the kit it describes.
 */

type Stage = {
  command: string;
  title: string;
  body: string;
  writes: string[];
};

const folder = featureFolder();

/**
 * Files in the feature folder written by a step, per the README's "(by)" column. Matched
 * either way round, because the README says `/remember save` where the site says
 * `/remember`, and `/feature start` where the site says `/feature start NN`.
 */
function writtenBy(step: string): string[] {
  return folder.filter((file) => file.by.startsWith(step) || step.startsWith(file.by)).map((file) => file.name);
}

function note(name: string): string {
  const file = folder.find((entry) => entry.name === name);
  if (!file) throw new Error(`context/features/README.md no longer lists ${name}.`);
  return file.note.charAt(0).toUpperCase() + file.note.slice(1) + ".";
}

function stage(command: string, title: string, skill: string, body?: string): Stage {
  return { command, title, body: body ?? readSkill(skill).description, writes: writtenBy(command) };
}

const featureSkill = readSkill("feature");

/** The loop, in the order it runs. A real sequence, which is why it is numbered. */
const LOOP: (Stage & { skill?: string })[] = [
  { ...stage("/feature start NN", "Open the work", "feature"), skill: "feature" },
  { ...stage("/architect", "Decide before building", "architect"), skill: "architect" },
  {
    command: "",
    title: "Build it",
    body: note("log.md"),
    writes: writtenBy("during"),
  },
  { ...stage("/review", "Check it with fresh eyes", "review"), skill: "review" },
  {
    ...stage("/feature finish", "Close it, or don't", "feature", skillSection(featureSkill, "`/feature finish`")),
    skill: "feature",
  },
];

/** The ones that run when something happens, rather than in order. */
const OUT_OF_BAND: (Stage & { skill: string })[] = [
  { ...stage("/remember", "Across sessions", "remember"), skill: "remember" },
  { ...stage("/recover", "When a fix doesn't take", "recover"), skill: "recover" },
  { ...stage("/harvest", "So it's only paid for once", "harvest"), skill: "harvest", writes: ["knowledge/*.md"] },
  { ...stage("/imprint", "Keep composition consistent", "imprint"), skill: "imprint", writes: ["ui-registry.md"] },
];

const SKILLS = skillNames();

{
  const covered = new Set([...LOOP, ...OUT_OF_BAND].flatMap((entry) => (entry.skill ? [entry.skill] : [])));
  const missing = SKILLS.filter((name) => !covered.has(name));
  const stale = [...covered].filter((name) => !SKILLS.includes(name));
  if (missing.length || stale.length) {
    throw new Error(
      `app/_site/kit.ts is out of step with skills/: ${[
        missing.length ? `not on the site: ${missing.join(", ")}` : "",
        stale.length ? `no longer in skills/: ${stale.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("; ")}.`,
    );
  }
}

type TreeNode = { name: string; note?: string; children?: TreeNode[] };

/**
 * One line each for the top of `context/`. The file list is read from disk; only the notes
 * are written here, and a file without one fails the build.
 */
const CONTEXT_NOTES: Record<string, string> = {
  "overview.md": "what this project is, what it is not, and who consumes it",
  "standards.md": "the house style, with a specimen to copy rather than a rule to interpret",
  "build-plan.md": "numbered stages, each with its own “done when”",
  "progress.md": "a status block and a checklist — nothing else",
};

{
  const onDisk = contextFiles();
  const unnoted = onDisk.filter((name) => !(name in CONTEXT_NOTES));
  const stale = Object.keys(CONTEXT_NOTES).filter((name) => !onDisk.includes(name));
  if (unnoted.length || stale.length) {
    throw new Error(
      `CONTEXT_NOTES in app/_site/kit.ts is out of step with context/: ${[...unnoted, ...stale].join(", ")}.`,
    );
  }
}

const CONTEXT_TREE: TreeNode[] = [
  {
    name: "context/",
    children: [
      // The notes' order, not the directory's: overview first reads as the order to read them in.
      ...Object.entries(CONTEXT_NOTES).map(([name, note]) => ({ name, note })),
      {
        name: "features/",
        children: [
          { name: "README.md", note: "the folder's shape, and the rule with teeth" },
          { name: "NN-slug/", children: folder.map((file) => ({ name: file.name, note: file.note })) },
        ],
      },
    ],
  },
];

/** The three kickoff prompts, source shown in full — read once, in run order. */
const PROMPT_FILES = promptFiles();

/** One line each, same discipline as `CONTEXT_NOTES`: a stage without one fails the build. */
const PROMPT_NOTES: Record<string, string> = {
  "01-interview.md": "Turns a person's answers into project-overview.md — what it is, who it's for, what it deliberately won't do.",
  "02-architecture.md": "Turns the overview into architecture.md — the stack, the schema, the data flow.",
  "03-build-plan.md": "Turns both into build-plan.md — numbered features, ordered by what depends on what.",
};

{
  const onDisk = PROMPT_FILES.map((prompt) => prompt.file);
  const unnoted = onDisk.filter((name) => !(name in PROMPT_NOTES));
  const stale = Object.keys(PROMPT_NOTES).filter((name) => !onDisk.includes(name));
  if (unnoted.length || stale.length) {
    throw new Error(`PROMPT_NOTES in app/_site/kit.ts is out of step with prompts/: ${[...unnoted, ...stale].join(", ")}.`);
  }
}

/**
 * One line each for the `next16-insforge` template. The file list is read from disk; only
 * the notes are written here, and a file without one fails the build — same discipline as
 * `CONTEXT_NOTES` below, because this tree makes the same claim: what's here is what
 * `kit init` will actually copy, not a description of it.
 */
const TEMPLATE_NOTES: Record<string, string> = {
  "code-standards.md": "implementation rules — copied with blanks for the project's own dependencies and tracked events",
  "ui-rules.md": "layout and component conventions, in terms of the token contract rather than hardcoded values",
  "library-docs.md": "the discipline header only — a pattern is added the first time the project actually uses a library",
  "progress.md": "the same status-block-and-checklist shape as this repo's own, seeded empty",
  "ui-registry.md": "the decisions the contract doesn't make — composition, custom-component token choices — kept current by imprint",
  "features/README.md": "the feature-folder shape, unchanged from this repo's own copy",
};

{
  const onDisk = templateFiles("next16-insforge");
  const unnoted = onDisk.filter((name) => !(name in TEMPLATE_NOTES));
  const stale = Object.keys(TEMPLATE_NOTES).filter((name) => !onDisk.includes(name));
  if (unnoted.length || stale.length) {
    throw new Error(
      `TEMPLATE_NOTES in app/_site/kit.ts is out of step with templates/next16-insforge/: ${[...unnoted, ...stale].join(", ")}.`,
    );
  }
}

const TEMPLATE_TREE: TreeNode[] = [
  {
    name: "templates/next16-insforge/",
    children: [
      ...Object.entries(TEMPLATE_NOTES)
        .filter(([name]) => !name.includes("/"))
        .map(([name, note]) => ({ name, note })),
      { name: "features/", children: [{ name: "README.md", note: TEMPLATE_NOTES["features/README.md"] }] },
    ],
  },
];


/**
 * The two halves as artefacts rather than descriptions, for the landing page. Every string
 * below is read from the thing it describes: reword `no-raw-colors`, or edit
 * `skills/feature/SKILL.md`, and this section changes on the next build. That is the claim
 * the section makes, so it had better be true of the section itself.
 *
 * `/docs` still renders the prose `HALVES` below — a "Start here" page has to explain
 * where a landing page has to convince. Revisit when the docs pass happens.
 */

/** The specimen skill: first in the loop, and the one whose description has the teeth. */
const SPECIMEN = "feature";

{
  // Same discipline as every other cross-check here: a renamed specimen fails the build
  // with a sentence, rather than an ENOENT from five routes that never render it.
  if (!skillNames().includes(SPECIMEN)) {
    throw new Error(`app/_site/kit.ts names "${SPECIMEN}" as its specimen skill, but skills/${SPECIMEN}/ is gone.`);
  }
}

/*
 * The class the rule rejects, assembled rather than written.
 *
 * Not cleverness: `no-raw-colors` lints this file, and a bare "bg-blue-500" literal here
 * would be a real violation — correctly, since the rule cannot tell a specimen from a
 * mistake. Writing it inside a longer JSX string would *also* pass today, but only because
 * the rule splits on whitespace and `className="bg-blue-500` fails its leading anchor —
 * an accident of the tokeniser that any sensible improvement to the rule would take away,
 * turning `bun run check` red on the one file that demonstrates the rule. Assembling the
 * class from parts depends on nothing and says what it means.
 */
const OFFENDING_CLASS = ["bg", "blue", "500"].join("-");
const VIOLATION = `<div className="${OFFENDING_CLASS} p-4">`;
const FIX = '<div className="bg-primary p-4">';

const EVIDENCE = [
  {
    title: "The agent kit",
    lead: "A new repo starts with the skills, context and gotchas already in it.",
    artefact: {
      kind: "source" as const,
      path: `skills/${SPECIMEN}/SKILL.md`,
      content: skillFrontmatter(SPECIMEN),
      excerpt: skillExcerpt(SPECIMEN, 18),
    },
    facts: `${skillNames().length} skills · installed by kit init`,
    href: "/docs/loop",
    linkLabel: "Read the loop",
  },
  {
    title: "The design system",
    lead: "One contract every component obeys, in every project, in both themes.",
    artefact: {
      kind: "lint" as const,
      path: "app/page.tsx",
      violation: VIOLATION,
      offending: OFFENDING_CLASS,
      fix: FIX,
      message: lintMessage("palette", { className: OFFENDING_CLASS }),
    },
    facts: `${Object.keys(contract.tokens).length} tokens · ${themeNames().length} themes · fails in the editor and in CI`,
    href: "/docs/tokens",
    linkLabel: "Read the contract",
  },
];

/** The files a finished pass through the loop leaves in a feature folder, in the order they're written. */
const LOOP_FILES = ["spec.md", "plan.md", "log.md", "review.md"] as const;

/** The most recent features in this repo, newest first, for the landing page's hero table. */
const RECENT_FEATURES = featureFolders()
  .slice(-4)
  .reverse()
  .map((feature) => ({
    ...feature,
    loop: LOOP_FILES.filter((file) => feature.files.includes(file)).length,
    reviewed: feature.files.includes("review.md"),
  }));

/** Counts the landing page states as fact. Every one is read off disk. */
const STATS = {
  skills: skillNames().length,
  tokens: Object.keys(contract.tokens).length,
  themes: themeNames().length,
  gotchas: knowledgeFiles().reduce((total, file) => total + file.gotchas, 0),
};

/** The preset the landing page's kit init command names. It has to exist on disk. */
const PRESET = "next16-insforge";

/** What `kit init <preset>` leaves in a project, in the order the command writes it. */
const KIT_INIT = {
  command: `bunx @ja3dan/kit init ${PRESET}`,
  writes: [
    { name: "context/", note: `${templateFiles(PRESET).length} files of house style from the preset` },
    { name: ".claude/skills/", note: `the ${skillNames().length} lifecycle skills` },
    { name: "components.json", note: "the design system, through shadcn init" },
    { name: kitLockFile(), note: "what was installed, hashed" },
  ],
};

/**
 * Each kickoff prompt paired with the file it writes, parsed from its own note ("Turns ...
 * into project-overview.md"), so a renamed output fails the build instead of the page.
 */
const KICKOFF = PROMPT_FILES.map((prompt) => {
  const output = /into (\S+\.md)/.exec(PROMPT_NOTES[prompt.file] ?? "")?.[1];
  if (!output) throw new Error(`PROMPT_NOTES for ${prompt.file} no longer names the file it writes.`);
  // What the output holds: the note's second clause, e.g. "the stack, the schema, the data flow".
  const holds = (PROMPT_NOTES[prompt.file] ?? "").split(" \u2014 ")[1]?.replace(/\.$/, "") ?? "";
  return { prompt: prompt.file, output, holds };
});

type ProjectLine = { name: string; depth: number; step?: 1 | 2 | 3; note?: string };

/**
 * A project after the three steps, as one tree, each file tagged with the step that wrote it.
 * The house style files and the kickoff outputs are read from the preset and the prompt
 * notes; the edits to globals.css, eslint.config.mjs and package.json are what
 * `packages/kit/src/commands/init.ts` does (cleanTailwindCss, wireEslintPlugin,
 * ensureCheckScript).
 */
/** Folders first, then files by name: the order an editor's file tree shows them in. */
function editorOrder(lines: { name: string }[]) {
  return [...lines].sort((x, y) => {
    const xDir = x.name.endsWith("/");
    const yDir = y.name.endsWith("/");
    return xDir === yDir ? x.name.localeCompare(y.name) : xDir ? -1 : 1;
  });
}

const CONTEXT_FILES = editorOrder([
  ...templateFiles(PRESET)
    .filter((file) => !file.includes("/"))
    .map((file) => ({ name: file, step: 1 as const })),
  ...KICKOFF.map((entry) => ({ name: entry.output, step: 2 as const, note: `from ${entry.prompt}` })),
]) as { name: string; step: 1 | 2; note?: string }[];

const PROJECT_TREE: ProjectLine[] = [
  { name: ".claude/skills/", depth: 0, step: 1, note: `${skillNames().length} lifecycle skills` },
  { name: "app/globals.css", depth: 0, step: 1, note: "imports the contract and a theme" },
  { name: "context/", depth: 0 },
  { name: "features/", depth: 1 },
  { name: "01-slug/", depth: 2, step: 3 },
  { name: "spec.md", depth: 3, step: 3, note: "from /feature start" },
  ...templateFiles(PRESET)
    .filter((file) => file.startsWith("features/"))
    .map((file) => ({ name: file.slice("features/".length), depth: 2, step: 1 as const })),
  ...CONTEXT_FILES.map((file) => ({ ...file, depth: 1 })),
  { name: "components.json", depth: 0, step: 1, note: "points shadcn at the registry" },
  { name: "eslint.config.mjs", depth: 0, step: 1, note: "no-raw-colors wired in" },
  { name: kitLockFile(), depth: 0, step: 1, note: "what was installed, hashed" },
  { name: "package.json", depth: 0, step: 1, note: "adds a check script" },
];

/** The three steps beside the tree. */
const PROJECT_STEPS = [
  {
    step: 1 as const,
    title: "Run kit init",
    body: "Installs the skills, the house style and the design system into an empty repo, then locks what it installed.",
    command: KIT_INIT.command,
  },
  {
    step: 2 as const,
    title: "Run the kickoff prompts",
    body: `Paste ${KICKOFF.length} prompts into any LLM chat, in order. Each answer feeds the next, and all of them land in context/.`,
  },
  {
    step: 3 as const,
    title: "Start the first feature",
    body: "The feature skill opens a branch and a folder, and writes the spec before any code.",
    command: "/feature start 01",
  },
];

/** The setup guide's facts about the kit CLI, all read from the kit's own source. */
const KIT_DOCS = {
  preset: PRESET,
  eslint: kitEslintWiring(),
  usage: {
    doctor: kitUsage("doctor"),
    check: kitUsage("check"),
    syncStatus: kitUsage("sync status"),
    syncUpdate: kitUsage("sync update"),
  },
};

const HALVES = [
  {
    title: "The agent kit",
    lead: "What makes a new repo start with your context, your guardrails and your loop instead of a blank CLAUDE.md.",
    href: "/docs/loop",
    linkLabel: "Read the loop",
    parts: [
      {
        name: "skills/",
        body: `The ${SKILLS.length} lifecycle skills, installed into the project so the agent has them from day one.`,
      },
      { name: "context/", body: "The architecture written down before any code exists — overview, standards, build plan, and a folder per feature." },
      { name: "knowledge/", body: "Gotchas harvested from projects that already paid for them, tagged by stack and installed to match." },
      { name: "hooks", body: "The rules that prose could not hold: generated files refuse edits, raw colours fail at edit time." },
    ],
  },
  {
    title: "The design system",
    lead: "One contract every component obeys, so the same button works in every project and takes on each project's theme.",
    href: "/docs/tokens",
    linkLabel: "Read the contract",
    parts: [
      { name: "@ja3dan/tokens", body: "Semantic names and roles. Values live in a theme, once for light and once for dark." },
      { name: "@ja3dan/eslint-plugin", body: "Fails the build on a hex, an arbitrary colour or a palette class. Runs in the editor too." },
      { name: "@ja3dan registry", body: "Components copied into the project by shadcn, versioned so a later update can merge with your edits." },
    ],
  },
];

export {
  CONTEXT_TREE,
  EVIDENCE,
  HALVES,
  KICKOFF,
  KIT_DOCS,
  KIT_INIT,
  PROJECT_STEPS,
  PROJECT_TREE,
  LOOP_FILES,
  RECENT_FEATURES,
  STATS,
  LOOP,
  OUT_OF_BAND,
  PROMPT_FILES,
  PROMPT_NOTES,
  SKILLS,
  TEMPLATE_TREE,
  type ProjectLine,
  type Stage,
  type TreeNode,
};
