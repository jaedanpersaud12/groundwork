import { existsSync } from "node:fs";

import { LOCK_FILE, lockPath } from "../lockfile";
import { readTemplate } from "../registry";
import { status, type StatusResult } from "./status";

type RequiredCheck = { label: string; reason: string; scope: "always" | "kickoff"; run: (cwd: string) => string | null };

/**
 * The bootstrapped project — `/kickoff` + `kit init` — is the design center, not jobpilot:
 * see context/features/05-kit-check-doctor/plan.md. Only "always" entries run today, since
 * 06 doesn't exist yet to say what its files are named; "kickoff" is a real, empty bucket
 * so 06 adds to this list instead of doctor being redesigned.
 */
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
