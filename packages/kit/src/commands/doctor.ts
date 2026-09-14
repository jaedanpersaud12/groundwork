import { existsSync } from "node:fs";
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

type RequiredResult = { label: string; ok: boolean; detail: string | null };

type DoctorResult = {
  required: RequiredResult[];
  /** Real, but empty until 06 defines what a kickoff-bootstrapped project's files are named. */
  kickoffChecks: RequiredResult[];
  items: StatusResult | null;
};

/** A hard failure: a required file is missing, or a locked item's files are missing. False for staleness alone. */
function doctorFailed(result: DoctorResult): boolean {
  return result.required.some((check) => !check.ok) || (result.items?.items.some((item) => item.missing.length > 0) ?? false);
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
  const items = required.every((check) => check.ok) ? await status(cwd) : null;
  return { required, kickoffChecks, items };
}

export { doctor, doctorFailed, type DoctorResult, type RequiredResult };
