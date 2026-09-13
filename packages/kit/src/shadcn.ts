import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";

const run = promisify(execFile);

/**
 * kit drives the shadcn it depends on, never whatever `bunx shadcn` resolves to. Two of
 * the functions below read shadcn's human-facing `--dry-run` output, which is not a
 * documented interface; pinning the version is what makes that safe, and
 * `shadcn.test.ts` fails the day an upgrade changes the format.
 *
 * Resolved as the package itself, not `shadcn/package.json`: shadcn's `exports` doesn't list
 * `package.json`, and Node enforces that where Bun doesn't. Its `.` export is `dist/index.js`,
 * the same file as its `bin`.
 */
const SHADCN_BIN = createRequire(import.meta.url).resolve("shadcn");

/** A dry run can take a while when shadcn resolves dependencies over the network. */
const TIMEOUT_MS = 120_000;

type PlannedFile = {
  /** Project-relative path, with the project's aliases already applied. */
  path: string;
  status: "create" | "overwrite" | "skip";
};

async function shadcn(cwd: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await run(process.execPath, [SHADCN_BIN, ...args, "--cwd", cwd], {
      cwd,
      timeout: TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    const { stdout = "", stderr = "", message } = error as { stdout?: string; stderr?: string; message: string };
    throw new Error(`shadcn ${args.join(" ")} failed in ${cwd}\n${stderr || stdout || message}`.trim());
  }
}

/**
 * The file lines of a dry run's summary: `│ + ui/button.tsx   create`,
 * `│ ~ ui/button.tsx   overwrite`, `│ = ui/button.tsx   skip (identical)`. Dependency lines
 * (`│ + motion`) share the marker but have no status column, which is how they're told apart.
 */
const PLANNED_FILE = /^│ ([+~=]) (\S+)\s+(create|overwrite|skip)\b/;

function parsePlan(stdout: string): PlannedFile[] {
  return stdout
    .split("\n")
    .map((line) => PLANNED_FILE.exec(line))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => ({ path: match[2], status: match[3] as PlannedFile["status"] }));
}

/**
 * `--view` prints each content line as `│ │ <line>`, and an empty line as `│ │ ` or `│ │`.
 * Stripping that prefix was checked byte-for-byte against real installs in step 1 of the
 * build (see the feature log). The box's frame lines start `│ ┌` and `│ └`, so they can't be
 * mistaken for content.
 */
function parseView(stdout: string): string | null {
  const body: string[] = [];
  let seen = false;
  for (const line of stdout.split("\n")) {
    if (line.startsWith("│ │ ")) body.push(line.slice(4));
    else if (line === "│ │") body.push("");
    else continue;
    seen = true;
  }
  return seen ? body.join("\n") : null;
}

/**
 * Where each file of the given items would land in this project, and what `add` would do to
 * it. Several items go in one call — one dry run for a whole registry takes about as long as
 * one for a single item — but the output doesn't say which item a file came from.
 */
async function planAdd(cwd: string, items: string | string[]): Promise<PlannedFile[]> {
  return parsePlan(await shadcn(cwd, ["add", ...[items].flat(), "--dry-run"]));
}

/**
 * One file of an item, exactly as `shadcn add` would write it into this project — aliases
 * rewritten — without writing anything or installing dependencies. Pass a versioned item URL
 * to get a past version: that is how kit derives the merge base.
 *
 * Returns what the registry would install even when the project's copy differs, which is
 * the point: the project's copy is the other side of the merge.
 */
async function viewFile(cwd: string, item: string, file: string): Promise<string> {
  const content = parseView(await shadcn(cwd, ["add", item, "--dry-run", "--view", file]));
  if (content === null) {
    throw new Error(`shadcn printed no content for ${file} from ${item}. Is the path one this item installs?`);
  }
  return content;
}

/**
 * Installs items for real. Only used for items that aren't in the project yet, so every file it
 * writes is new — it never answers an overwrite prompt on the project's behalf.
 */
async function installItems(cwd: string, items: string[]): Promise<void> {
  await shadcn(cwd, ["add", ...items, "-y"]);
}

export { installItems, parsePlan, parseView, planAdd, SHADCN_BIN, viewFile, type PlannedFile };
