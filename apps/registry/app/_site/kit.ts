/**
 * The agent-kit half of groundwork, as the site needs to describe it. Kept beside the
 * registry data rather than inside a page so the landing page and the docs pages cannot
 * drift into describing the loop two different ways.
 */

export type Stage = {
  command: string;
  title: string;
  body: string;
  writes?: string;
};

/** The loop, in the order it runs. A real sequence, which is why it is numbered. */
export const LOOP: Stage[] = [
  {
    command: "/feature start NN",
    title: "Open the work",
    body: "Looks the number up in the build plan, refuses to start on a dirty tree, cuts the branch and writes the spec — including criteria someone other than you could check. “Filtering works” is not one. “Selecting a status narrows the table and the count updates” is.",
    writes: "spec.md",
  },
  {
    command: "/architect",
    title: "Decide before building",
    body: "A senior engineer sitting with you before you start, not a grilling. It surfaces the decisions that change the implementation, names the assumptions that have not been tested yet, and orders the work so the riskiest one is settled first.",
    writes: "plan.md",
  },
  {
    command: "",
    title: "Build it",
    body: "Decisions and evidence go into the log as they happen, not reconstructed afterwards. This is the step the other five exist to protect.",
    writes: "log.md",
  },
  {
    command: "/review",
    title: "Check it with fresh eyes",
    body: "Cheap automated checks first, because they cost nothing. Then a subagent that sees only the spec, the plan, the diff and the rules — not the conversation that produced them, which is what makes it a second opinion rather than an echo.",
    writes: "review.md",
  },
  {
    command: "/feature finish",
    title: "Close it, or don't",
    body: "Every criterion needs a line saying how it was checked. “Not verified, because the staging data has no failed payment yet” closes a criterion. Silence does not. Then the docs get fixed, the gotchas get harvested, and the PR is written from the log.",
  },
];

/** The three that run when something happens, rather than in order. */
export const OUT_OF_BAND: Stage[] = [
  {
    command: "/remember",
    title: "Across sessions",
    body: "Sessions start blank. `save` writes where you got to into the feature's handoff; `restore` reads it back at the start of the next one.",
    writes: "handoff.md",
  },
  {
    command: "/recover",
    title: "When a fix doesn't take",
    body: "The instinct when something breaks is to keep prompting. The session gets longer, the context gets polluted, the code gets worse. This diagnoses which kind of failure it is first — targeted fix, hard reset, or rethink — because the right response depends on that answer.",
  },
  {
    command: "/harvest",
    title: "So it's only paid for once",
    body: "A gotcha you solve and don't write down, you solve again in the next project. This promotes it into the knowledge base, tagged by stack, where the next project's kickoff will install it.",
    writes: "knowledge/*.md",
  },
];

export type TreeNode = { name: string; note?: string; children?: TreeNode[] };

/** What a project's `context/` holds once groundwork has set it up. */
export const CONTEXT_TREE: TreeNode[] = [
  {
    name: "context/",
    children: [
      { name: "overview.md", note: "what this project is, what it is not, and who consumes it" },
      { name: "standards.md", note: "the house style, with a specimen to copy rather than a rule to interpret" },
      { name: "build-plan.md", note: "numbered stages, each with its own “done when”" },
      { name: "progress.md", note: "a status block and a checklist — nothing else" },
      {
        name: "features/",
        children: [
          {
            name: "04-kit-sync/",
            children: [
              { name: "spec.md", note: "what it is, and the criteria" },
              { name: "plan.md", note: "how it gets built" },
              { name: "log.md", note: "decisions and evidence, as they happen" },
              { name: "review.md", note: "what the reviewer found" },
              { name: "handoff.md", note: "where to pick up next session" },
            ],
          },
        ],
      },
    ],
  },
];

export const HALVES = [
  {
    title: "The agent kit",
    lead: "What makes a new repo start with your context, your guardrails and your loop instead of a blank CLAUDE.md.",
    href: "/docs/loop",
    linkLabel: "Read the loop",
    parts: [
      { name: "skills/", body: "The six lifecycle commands, installed into the project so the agent has them from day one." },
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
