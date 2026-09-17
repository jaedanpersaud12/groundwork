import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { readSkills, readTemplate as readTemplateFiles } from "../assets";
import { LOCK_FILE, lockPath } from "../lockfile";
import { readTemplate } from "../registry";
import { status, type StatusResult } from "./status";

type RequiredCheck = { label: string; reason: string; scope: "always" | "kickoff"; run: (cwd: string) => string | null };

/** The only preset today — see 09's out-of-scope. A second preset needs this parameterized by lock metadata. */
const KICKOFF_PRESET = "next16-insforge";

/**
 * The bootstrapped project — `/kickoff` + `kit init` — is the design center, not an existing
 * project migrated onto the registry. Generated from kit's own bundled assets
 * (09) rather than hand-typed, so it can't drift from what `kit init` actually installs.
 */
function kickoffChecks(): RequiredCheck[] {
  const templateChecks: RequiredCheck[] = readTemplateFiles(KICKOFF_PRESET).map((file) => ({
    label: `context/${file.path} exists`,
    reason: `the ${KICKOFF_PRESET} template installs it`,
    scope: "kickoff",
    run: (cwd) =>
      existsSync(path.join(cwd, "context", file.path))
        ? null
        : `No context/${file.path} in ${cwd}. Run \`kit init\`, or copy it from templates/${KICKOFF_PRESET}/ by hand.`,
  }));
  const skillChecks: RequiredCheck[] = readSkills().map((skill) => ({
    label: `.claude/skills/${skill.name}/SKILL.md exists`,
    reason: "a kickoff-installed lifecycle skill",
    scope: "kickoff",
    run: (cwd) =>
      existsSync(path.join(cwd, ".claude", "skills", skill.name, "SKILL.md"))
        ? null
        : `No .claude/skills/${skill.name}/SKILL.md in ${cwd}. Run \`kit init\`.`,
  }));
  return [...templateChecks, ...skillChecks];
}

const REQUIRED: RequiredCheck[] = [
  {
    label: "components.json has a @ja3dan registry entry",
    reason: "kit needs to know which registry to sync against",
    scope: "always",
    run: (cwd) => {
      try {
        readTemplate(cwd);
        return null;
      } catch (error) {
        return (error as Error).message;
      }
    },
  },
  {
    label: `${LOCK_FILE} exists`,
    reason: "kit needs a record of what's installed, to check it against",
    scope: "always",
    run: (cwd) => (existsSync(lockPath(cwd)) ? null : `No ${LOCK_FILE} in ${cwd}. Run \`kit lock\` first.`),
  },
  ...kickoffChecks(),
];

type RequiredResult = { label: string; ok: boolean; detail: string | null; pending?: boolean };

/**
 * What the three kickoff prompts produce, and the sections each prompt's own Output section asks
 * for. A doctor that passed with all three deleted was checking the scaffolding and not the context
 * every later session reads first.
 */
type Section = { name: string; pattern: RegExp };

const heading = (name: string): Section => ({
  name,
  pattern: new RegExp(`^#{1,6}\\s*(?:\\d+\\.\\s*)?${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "im"),
});

const KICKOFF_OUTPUTS: { file: string; stage: string; sections: Section[] }[] = [
  {
    file: "project-overview.md",
    stage: "01-interview",
    sections: [
      "About the Project",
      "The Problem It Solves",
      "Pages",
      "Navigation",
      "Core User Flow",
      "Data Ownership",
      "Features In Scope",
      "Features Out of Scope",
      "Target User",
      "Success Criteria",
    ].map(heading),
  },
  {
    file: "architecture.md",
    stage: "02-architecture",
    sections: ["Stack", "Folder Structure", "System Boundaries", "Data Flow", "Database Schema", "Invariants"].map(heading),
  },
  {
    file: "build-plan.md",
    stage: "03-build-plan",
    sections: [
      heading("Core Principle"),
      { name: "a `## Phase N` heading", pattern: /^#{1,6}\s*Phase\b/im },
      { name: "a numbered `### NN` feature", pattern: /^#{1,6}\s*\d{2}\b/m },
    ],
  },
];

/** Kickoff is done once work has started: a numbered feature folder is the evidence of that. */
function workHasStarted(cwd: string): boolean {
  const features = path.join(cwd, "context", "features");
  if (!existsSync(features)) return false;
  return readdirSync(features, { withFileTypes: true }).some((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name));
}

function kickoffOutputChecks(cwd: string): RequiredResult[] {
  const started = workHasStarted(cwd);
  return KICKOFF_OUTPUTS.map(({ file, stage, sections }) => {
    const label = `context/${file} written by kickoff`;
    const full = path.join(cwd, "context", file);
    if (!existsSync(full)) {
      return started
        ? { label, ok: false, detail: `No context/${file} in ${cwd}, but features have started. Run the ${stage} kickoff prompt and save its output there.` }
        : { label, ok: true, pending: true, detail: `context/${file} not written yet — the ${stage} kickoff prompt produces it.` };
    }
    const text = readFileSync(full, "utf8");
    const missing = sections.filter((section) => !section.pattern.test(text)).map((section) => section.name);
    return missing.length === 0
      ? { label, ok: true, detail: null }
      : {
          label,
          ok: false,
          detail: `context/${file} is missing ${missing.join(", ")}. The ${stage} prompt's Output section lists what it needs.`,
        };
  });
}

/**
 * Tools that write `.gitignore` for themselves can swallow the kit's files — the InsForge CLI adds a
 * bare `.claude`, and a skill installed after that commit is never versioned. Checked with git itself,
 * so every ignore source (nested .gitignore, info/exclude, global excludes) counts.
 */
function ignoredKitFiles(cwd: string): RequiredResult[] {
  const candidates = [
    ...readSkills().map((skill) => `.claude/skills/${skill.name}/SKILL.md`),
    LOCK_FILE,
    "context/progress.md",
  ];
  const ignored: string[] = [];
  for (const candidate of candidates) {
    try {
      execFileSync("git", ["check-ignore", "-q", "--no-index", candidate], { cwd, stdio: "ignore" });
      ignored.push(candidate);
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 128) return []; // not a git repository: nothing to be ignored by
    }
  }
  const label = "kit's files aren't git-ignored";
  if (ignored.length === 0) return [{ label, ok: true, detail: null }];
  return [
    {
      label,
      ok: false,
      detail: `.gitignore rules ignore ${ignored.join(", ")} — they'd never be committed. Find the rule with \`git check-ignore -v ${ignored[0]}\` and narrow it (a bare \`.claude\` added by another CLI → \`.claude/settings.local.json\`).`,
    },
  ];
}

type DoctorResult = {
  required: RequiredResult[];
  /** The three kickoff prompts' outputs; `pending` until the first feature folder exists. */
  kickoffOutputs: RequiredResult[];
  /** Real, but empty until 06 defines what a kickoff-bootstrapped project's files are named. */
  kickoffChecks: RequiredResult[];
  items: StatusResult | null;
};

/** A hard failure: a required file is missing, or a locked item's files are missing. False for staleness alone. */
function doctorFailed(result: DoctorResult): boolean {
  return (
    result.required.some((check) => !check.ok) ||
    result.kickoffOutputs.some((check) => !check.ok) ||
    (result.items?.items.some((item) => item.missing.length > 0) ?? false)
  );
}

async function doctor(cwd: string): Promise<DoctorResult> {
  const required = REQUIRED.filter((check) => check.scope === "always").map((check) => {
    const detail = check.run(cwd);
    return { label: check.label, ok: detail === null, detail };
  });
  const kickoffChecks = REQUIRED.filter((check) => check.scope === "kickoff").map((check) => {
    const detail = check.run(cwd);
    return { label: check.label, ok: detail === null, detail };
  });
  required.push(...ignoredKitFiles(cwd));
  const kickoffOutputs = kickoffOutputChecks(cwd);
  const items = required.every((check) => check.ok) ? await status(cwd) : null;
  return { required, kickoffChecks, kickoffOutputs, items };
}

export { doctor, doctorFailed, ignoredKitFiles, kickoffOutputChecks, type DoctorResult, type RequiredResult };
