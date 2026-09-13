import { contextFiles, featureFolder, readSkill, skillNames, skillSection } from "./repo";

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

export { CONTEXT_TREE, HALVES, LOOP, OUT_OF_BAND, SKILLS, type Stage, type TreeNode };
