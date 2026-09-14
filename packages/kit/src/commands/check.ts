import { ESLint } from "eslint";
import ja3danPlugin from "@ja3dan/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { declaredIn, requiredTokens, shadows } from "@ja3dan/tokens/validate";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { LOCK_FILE, readLock } from "../lockfile";
import { locateFiles } from "../project";
import { itemRef, loadRegistry } from "../registry";
import { planAdd } from "../shadcn";

type TokenProblem = { selector: string; missing: string[]; unknown: string[] };

type ForbiddenClassProblem = { file: string; line: number; className: string; message: string };

type CheckResult = { tokenProblems: TokenProblem[]; forbiddenClasses: ForbiddenClassProblem[] };

const IMPORT = /^@import\s+(?:url\()?["']([^"']+)["']\)?[^;]*;\s*$/gm;

/**
 * `tailwind.css` doesn't redeclare `--background` etc. itself in a project like jobpilot —
 * those live in `@ja3dan/tokens/themes/<name>.css`, pulled in by `@import`. Resolving one
 * level of that chain (recursively, since a theme file could itself import another) is what
 * makes the token check see what the browser actually sees.
 */
function resolveImports(cwd: string, filePath: string, seen: Set<string> = new Set()): string {
  if (seen.has(filePath)) return "";
  seen.add(filePath);
  const require = createRequire(path.join(cwd, "package.json"));
  const text = readFileSync(filePath, "utf8");
  return text.replace(IMPORT, (whole, specifier: string) => {
    let resolved: string;
    try {
      resolved = specifier.startsWith(".") ? path.join(path.dirname(filePath), specifier) : require.resolve(specifier);
    } catch {
      return "";
    }
    if (!resolved.endsWith(".css") || !existsSync(resolved)) return "";
    return resolveImports(cwd, resolved, seen);
  });
}

function tailwindCssPath(cwd: string): string {
  const file = path.join(cwd, "components.json");
  let config: { tailwind?: { css?: string } };
  try {
    config = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new Error(`No readable components.json in ${cwd}. Run kit from a project set up with shadcn.`);
  }
  if (!config.tailwind?.css) throw new Error(`components.json has no "tailwind.css" path in ${cwd}.`);
  return path.join(cwd, config.tailwind.css);
}

/** Every required token and required shadow, present in both `:root` and `.dark`, after resolving `@import`s. */
function tokensCheck(cwd: string): TokenProblem[] {
  const css = resolveImports(cwd, tailwindCssPath(cwd));
  const problems: TokenProblem[] = [];
  for (const selector of [":root", ".dark"]) {
    const declared = declaredIn(css, selector);
    const missing = [
      ...requiredTokens.filter((name) => !declared.has(name)),
      ...Object.entries(shadows)
        .filter(([name, spec]) => spec.required && !declared.has(`depth-${name}`))
        .map(([name]) => `depth-${name}`),
    ];
    if (missing.length) problems.push({ selector, missing, unknown: [] });
  }
  return problems;
}

/** The installed file paths for whatever `kit.lock.json` actually locks — not the whole registry. */
async function lockedFilePaths(cwd: string): Promise<string[]> {
  const lock = readLock(cwd);
  if (!lock) throw new Error(`No ${LOCK_FILE} in ${cwd}. Run \`kit lock\` first.`);
  const registry = await loadRegistry(cwd);
  const plan = await planAdd(cwd, registry.items.map((item) => itemRef(item.name)));
  const located = locateFiles(registry.items, plan);
  const names = new Set(Object.keys(lock.items).map((ref) => ref.slice(ref.indexOf("/") + 1)));
  return registry.items
    .filter((item) => names.has(item.name))
    .flatMap((item) => located.get(item.name)!.filter((file) => file.status !== "create").map((file) => file.path));
}

/**
 * Runs `@ja3dan/eslint-plugin`'s `no-raw-colors` standalone, scoped to the locked files only —
 * not the whole project, which may have its own raw colours outside anything kit installed (see
 * the accent-token collision in 03's log: a project's own code can use a name the contract also
 * claims, and that is a design tension for the theme, not a lint violation).
 */
async function forbiddenClassesCheck(cwd: string): Promise<ForbiddenClassProblem[]> {
  const files = await lockedFilePaths(cwd);
  if (files.length === 0) return [];
  const eslint = new ESLint({
    overrideConfigFile: true,
    cwd,
    baseConfig: [{ languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } } }, ja3danPlugin.configs.recommended],
  });
  const results = await eslint.lintFiles(files.map((file) => path.join(cwd, file)));
  return results.flatMap((result) =>
    result.messages
      .filter((message) => message.ruleId === "@ja3dan/no-raw-colors")
      .map((message) => ({
        file: path.relative(cwd, result.filePath),
        line: message.line,
        className: /`([^`]+)`/.exec(message.message)?.[1] ?? message.message,
        message: message.message,
      })),
  );
}

async function check(cwd: string): Promise<CheckResult> {
  const [tokenProblems, forbiddenClasses] = await Promise.all([tokensCheck(cwd), forbiddenClassesCheck(cwd)]);
  return { tokenProblems, forbiddenClasses };
}

export { check, type CheckResult, type ForbiddenClassProblem, type TokenProblem };
