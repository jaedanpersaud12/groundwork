#!/usr/bin/env node
import path from "node:path";
import { parseArgs } from "node:util";

import pkg from "../package.json" with { type: "json" };
import { lock, type LockedItem } from "./commands/lock";
import { status, type ItemStatus } from "./commands/status";
import { PENDING_MESSAGE, update } from "./commands/update";
import { LOCK_FILE } from "./lockfile";

const USAGE = `kit ${pkg.version} — keep installed @ja3dan registry items current

Usage:
  kit lock [--force]        write kit.lock.json for the items already installed
  kit sync status           what's outdated, and what's been edited locally
  kit sync update <item>    update one item on a branch: overwrite if unedited, 3-way merge if edited
    [--to <version>]        take a specific version, including one outside the item's track
  kit link [--off]          point @ja3dan at a local registry, or restore it

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

async function runUpdate(cwd: string, name: string | undefined, to: string | undefined): Promise<number> {
  if (!name) {
    process.stderr.write("kit: which item? `kit sync update <item>`, e.g. `kit sync update button`.\n");
    return 1;
  }
  const result = await update(cwd, name.replace(/^@ja3dan\//, ""), { to });
  process.stdout.write(`On branch ${result.branch}.\n\n${result.description}\n`);
  if (result.conflicted) {
    process.stdout.write(`Resolve the conflicts, then: git add -A && git commit -F ${PENDING_MESSAGE}\n`);
    return 1;
  }
  process.stdout.write(`Committed. Push ${result.branch} and open a PR; the commit message is the description.\n`);
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
  if (positionals[0] === "sync" && positionals[1] === "update") return runUpdate(cwd, positionals[2], values.to);

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
