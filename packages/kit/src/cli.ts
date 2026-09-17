#!/usr/bin/env node
import path from "node:path";
import { parseArgs } from "node:util";

import pkg from "../package.json" with { type: "json" };
import { check, LIGHT_ONLY_MARKER } from "./commands/check";
import { doctor, doctorFailed } from "./commands/doctor";
import { DEFAULT_REGISTRY, init } from "./commands/init";
import { link, type LinkResult, unlink } from "./commands/link";
import { list } from "./commands/list";
import { lock, type LockedItem } from "./commands/lock";
import { projectOwnSkills, skillsStatus, skillsUpdate, type SkillState } from "./commands/skills";
import { status, type ItemStatus } from "./commands/status";
import { MajorUpdateNeedsReview, update } from "./commands/update";
import { LOCK_FILE } from "./lockfile";

const USAGE = `kit ${pkg.version} — keep installed @ja3dan registry items current

Usage:
  kit lock [--force]        write kit.lock.json for the items already installed
  kit sync status           what's outdated, and what's been edited locally
  kit sync update <item>    update one item on a branch: overwrite if unedited, 3-way merge if edited
    [--to <version>]        take a specific version, including one outside the item's track
    [--accept-major]        merge a major update after reading its migration notes
  kit link [--url <url>]    point @ja3dan at a local registry (default http://localhost:3100)
    [--off]                 restore the registry URL from the committed components.json
  kit list [--url <url>]    every item the registry can install, and which are installed here
  kit skills status         the project's skills against this kit's: current, outdated, edited, missing, new
  kit skills update [name…]  install this kit's skills over outdated, missing and new ones, and lock them
    [--force]               also overwrite skills edited locally
  kit check                 scan locked files for raw colours and a theme missing required tokens
  kit doctor                required files, and the same outdated/missing info as sync status
  kit init <preset>         copy a template, install the skills, shadcn init, and lock both
    [--url <url>]           registry to init against (default ${DEFAULT_REGISTRY})

Options:
  --cwd <dir>               the project to act on (default: the current directory)
  -h, --help                show this message
  -v, --version             print the version
`;

const MATCH_LABEL: Record<LockedItem["match"], string> = {
  current: "current",
  past: "behind",
  edited: "edited — locked at the closest version",
};

/** Plain aligned columns: this prints into terminals, CI logs and PR descriptions alike. */
function table(rows: string[][]): string {
  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)));
  return rows.map((row) => row.map((cell, column) => cell.padEnd(widths[column])).join("  ").trimEnd()).join("\n");
}

async function runLock(cwd: string, force: boolean): Promise<number> {
  const { items } = await lock(cwd, { force });
  if (items.length === 0) {
    process.stdout.write(`No @ja3dan items are installed in ${cwd}; wrote an empty ${LOCK_FILE}.\n`);
    return 0;
  }
  const rows = [["item", "version", "state"], ...items.map((item) => [item.name, item.version, MATCH_LABEL[item.match]])];
  process.stdout.write(`${table(rows)}\n\nWrote ${LOCK_FILE} with ${items.length} item${items.length === 1 ? "" : "s"}.\n`);
  for (const item of items.filter((candidate) => candidate.missing.length)) {
    process.stdout.write(`  ${item.name} is missing ${item.missing.join(", ")}.\n`);
  }
  return 0;
}

/** One short phrase per item: what, if anything, needs doing. */
function describe(item: ItemStatus): string {
  const parts: string[] = [];
  if (item.baseChanged) parts.push(`⚠ published ${item.installed} changed since it was locked`);
  if (item.bump === "none") parts.push("up to date");
  else if (item.withinTrack) parts.push(`${item.bump} update available`);
  else if (item.bump === "major") parts.push(item.migrationNote ? "major update — has a migration note" : "major update — no migration note");
  else parts.push(`${item.bump} update — outside its ${item.track} track`);
  if (item.edited.length) parts.push(`edited: ${item.edited.join(", ")}`);
  if (item.missing.length) parts.push(`missing: ${item.missing.join(", ")}`);
  return parts.join("; ");
}

async function runStatus(cwd: string): Promise<number> {
  const result = await status(cwd);
  const rows = [
    ["item", "installed", "latest", "status"],
    ...result.items.map((item) => [item.name, item.installed, item.latest, describe(item)]),
  ];
  process.stdout.write(`${table(rows)}\n`);
  if (result.unlocked.length) {
    process.stdout.write(`\nInstalled but not in ${LOCK_FILE}: ${result.unlocked.join(", ")}. \`kit lock --force\` adds them.\n`);
  }
  if (result.removed.length) {
    process.stdout.write(`\nIn ${LOCK_FILE} but no longer in the registry: ${result.removed.join(", ")}.\n`);
  }
  const updates = result.items.filter((item) => item.withinTrack);
  if (updates.length) {
    process.stdout.write(`\n${updates.length} update${updates.length === 1 ? "" : "s"} available. \`kit sync update <item>\` applies one.\n`);
  }
  return 0;
}

async function runUpdate(cwd: string, name: string | undefined, to: string | undefined, acceptMajor: boolean): Promise<number> {
  if (!name) {
    process.stderr.write("kit: which item? `kit sync update <item>`, e.g. `kit sync update button`.\n");
    return 1;
  }
  let result;
  try {
    result = await update(cwd, name.replace(/^@ja3dan\//, ""), { to, acceptMajor });
  } catch (error) {
    if (!(error instanceof MajorUpdateNeedsReview)) throw error;
    process.stdout.write(`${error.message}\n`);
    for (const entry of error.notes) process.stdout.write(`\n  ${entry.version}\n  ${entry.note}\n`);
    process.stdout.write(`\nNothing was changed.\n`);
    return 1;
  }
  process.stdout.write(`On branch ${result.branch}.\n\n${result.description}\n`);
  if (result.conflicted) {
    process.stdout.write(`Resolve the conflicts, then: git add -A && git commit -F ${result.pendingMessagePath}\n`);
    return 1;
  }
  process.stdout.write(`Committed. Push ${result.branch} and open a PR; the commit message is the description.\n`);
  return 0;
}

/**
 * Linking leaves `components.json` dirty on purpose, so every run — including the no-op —
 * ends with the command that puts it back.
 */
async function runLink(cwd: string, off: boolean, url: string | undefined): Promise<number> {
  if (off && url) {
    process.stderr.write("kit: `--off` restores the committed URL, so it takes no `--url`.\n");
    return 1;
  }
  const result: LinkResult = off ? await unlink(cwd) : await link(cwd, { url });
  if (!result.changed) {
    process.stdout.write(`@ja3dan already points at ${result.to}; nothing changed.\n`);
    return 0;
  }
  process.stdout.write(`@ja3dan now resolves from ${result.to} (was ${result.from}).\n`);
  if (off) return 0;
  process.stdout.write(
    "components.json is now modified. Install or update items to try the local registry, then restore it: `kit link --off`.\n",
  );
  return 0;
}

async function runCheck(cwd: string): Promise<number> {
  const { tokenProblems, forbiddenClasses } = await check(cwd);
  if (tokenProblems.length === 0 && forbiddenClasses.length === 0) {
    process.stdout.write("kit check: clean.\n");
    return 0;
  }
  for (const problem of tokenProblems) {
    process.stdout.write(`✗ ${problem.selector} is missing: ${problem.missing.join(", ")}\n`);
  }
  if (tokenProblems.some((problem) => problem.selector === ".dark")) {
    process.stdout.write(
      `  A theme needs a .dark block unless it has no dark mode on purpose. If so, add the comment /* ${LIGHT_ONLY_MARKER} */ to the theme file.\n`,
    );
  }
  for (const problem of forbiddenClasses) {
    process.stdout.write(`✗ ${problem.file}:${problem.line} ${problem.message}\n`);
  }
  return 1;
}

async function runDoctor(cwd: string): Promise<number> {
  const result = await doctor(cwd);
  for (const entry of result.required) {
    process.stdout.write(`${entry.ok ? "✓" : "✗"} ${entry.ok ? entry.label : entry.detail}\n`);
  }
  process.stdout.write(
    result.kickoffChecks.length
      ? result.kickoffChecks.map((entry) => `${entry.ok ? "✓" : "✗"} ${entry.ok ? entry.label : entry.detail}\n`).join("")
      : "○ kickoff-installed files (skills/, context/, hooks) — not checked yet, lands with 06\n",
  );
  for (const entry of result.kickoffOutputs) {
    process.stdout.write(`${entry.pending ? "○" : entry.ok ? "✓" : "✗"} ${entry.ok && !entry.pending ? entry.label : entry.detail}\n`);
  }
  if (result.items) {
    const rows = [["item", "installed", "latest", "status"], ...result.items.items.map((item) => [item.name, item.installed, item.latest, describe(item)])];
    process.stdout.write(`\n${table(rows)}\n`);
  }
  return doctorFailed(result) ? 1 : 0;
}

async function runList(cwd: string, url: string | undefined): Promise<number> {
  const items = await list(cwd, { url: url ?? "" });
  const rows = [
    ["item", "tier", "latest", "installed", "description"],
    ...items.map((item) => [item.name, item.tier, item.version, item.installed ?? "—", item.description.length > 72 ? `${item.description.slice(0, 71)}…` : item.description]),
  ];
  process.stdout.write(`${table(rows)}\n\n${items.length} items. Install one with \`bunx shadcn@latest add @ja3dan/<item>\`.\n`);
  return 0;
}

const SKILL_LABEL: Record<SkillState, string> = {
  current: "current",
  outdated: "update available",
  edited: "edited locally — `--force` to overwrite",
  missing: "missing — update restores it",
  new: "new in this kit — update installs it",
  retired: "no longer shipped by this kit (left in place)",
};

async function runSkills(cwd: string, sub: string | undefined, names: string[], force: boolean): Promise<number> {
  if (sub === "status") {
    const statuses = skillsStatus(cwd);
    const rows = [["skill", "locked", "status"], ...statuses.map((skill) => [skill.name, skill.locked ?? "—", SKILL_LABEL[skill.state]])];
    process.stdout.write(`${table(rows)}\n`);
    const own = projectOwnSkills(cwd);
    if (own.length) process.stdout.write(`\nProject's own skills (not managed by kit): ${own.join(", ")}.\n`);
    const pending = statuses.filter((skill) => ["outdated", "missing", "new"].includes(skill.state));
    if (pending.length) process.stdout.write(`\n${pending.length} to install. \`kit skills update\` applies them.\n`);
    return 0;
  }
  if (sub === "update") {
    const { updated, skippedEdited } = skillsUpdate(cwd, { names, force });
    process.stdout.write(updated.length ? `Updated ${updated.join(", ")} to kit ${pkg.version}.\n` : "Skills already current.\n");
    if (skippedEdited.length) {
      process.stdout.write(`Left ${skippedEdited.join(", ")} alone: edited locally. Review, then \`kit skills update ${skippedEdited[0]} --force\` to take this kit's version.\n`);
    }
    process.stdout.write(`Locked in ${LOCK_FILE}.\n`);
    return 0;
  }
  process.stderr.write("kit: `kit skills status` or `kit skills update [name…] [--force]`.\n");
  return 1;
}

async function runInit(cwd: string, preset: string | undefined, url: string | undefined): Promise<number> {
  if (!preset) {
    process.stderr.write("kit: which preset? `kit init <preset>`, e.g. `kit init next16-insforge`.\n");
    return 1;
  }
  const result = await init(cwd, preset, { url });
  process.stdout.write(`Copied ${result.templateFiles.length} file${result.templateFiles.length === 1 ? "" : "s"} into context/.\n`);
  process.stdout.write(`Installed ${result.skills.length} skill${result.skills.length === 1 ? "" : "s"} into .claude/skills/.\n`);
  process.stdout.write(`Ran shadcn init and wrote ${LOCK_FILE}.\n`);
  return 0;
}

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      cwd: { type: "string" },
      force: { type: "boolean" },
      to: { type: "string" },
      url: { type: "string" },
      off: { type: "boolean" },
      "accept-major": { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });

  if (values.version) {
    process.stdout.write(`${pkg.version}\n`);
    return 0;
  }
  if (values.help || positionals.length === 0) {
    process.stdout.write(USAGE);
    return 0;
  }

  const cwd = path.resolve(values.cwd ?? process.cwd());
  const command = positionals.join(" ");

  if (command === "lock") return runLock(cwd, values.force ?? false);
  if (command === "sync status") return runStatus(cwd);
  if (positionals[0] === "sync" && positionals[1] === "update") return runUpdate(cwd, positionals[2], values.to, values["accept-major"] ?? false);
  if (command === "link") return runLink(cwd, values.off ?? false, values.url);
  if (command === "check") return runCheck(cwd);
  if (positionals[0] === "list") return runList(cwd, values.url);
  if (positionals[0] === "skills") return runSkills(cwd, positionals[1], positionals.slice(2), values.force ?? false);
  if (command === "doctor") return runDoctor(cwd);
  if (positionals[0] === "init") return runInit(cwd, positionals[1], values.url);

  process.stderr.write(`kit: \`${command}\` isn't built yet.\n\n${USAGE}`);
  return 1;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: Error) => {
    process.stderr.write(`kit: ${error.message}\n`);
    process.exitCode = 1;
  },
);
