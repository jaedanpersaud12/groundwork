#!/usr/bin/env node
import { parseArgs } from "node:util";

import pkg from "../package.json" with { type: "json" };

const USAGE = `kit ${pkg.version} — keep installed @ja3dan registry items current

Usage:
  kit lock                  write kit.lock.json for the items already installed
  kit sync status           what's outdated, and what's been edited locally
  kit sync update <item>    update one item: overwrite if unedited, 3-way merge if edited
  kit link [--off]          point @ja3dan at a local registry, or restore it

Options:
  --cwd <dir>               the project to act on (default: the current directory)
  -h, --help                show this message
  -v, --version             print the version
`;

function main(argv: string[]): number {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: false,
    options: {
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

  process.stderr.write(`kit: \`${positionals.join(" ")}\` isn't built yet.\n\n${USAGE}`);
  return 1;
}

process.exitCode = main(process.argv.slice(2));
