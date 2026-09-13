#!/usr/bin/env node
import path from "node:path";
import { parseArgs } from "node:util";

import pkg from "../package.json" with { type: "json" };
import { lock, type LockedItem } from "./commands/lock";
import { LOCK_FILE } from "./lockfile";

const USAGE = `kit ${pkg.version} — keep installed @ja3dan registry items current

Usage:
  kit lock [--force]        write kit.lock.json for the items already installed
  kit sync status           what's outdated, and what's been edited locally
  kit sync update <item>    update one item: overwrite if unedited, 3-way merge if edited
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

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      cwd: { type: "string" },
      force: { type: "boolean" },
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
