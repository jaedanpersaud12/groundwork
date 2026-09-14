import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import pkg from "../../package.json" with { type: "json" };
import { readSkills, readTemplate } from "../assets";
import { LOCK_FILE, readLock, writeLock, type Lock, type SkillEntry } from "../lockfile";
import { initProject } from "../shadcn";
import { tailwindCssPath } from "./check";
import { lock } from "./lock";

/** Where a fresh project points if nothing overrides it — the deployed registry, not local dev. */
const DEFAULT_REGISTRY = "https://gw.jaedan.me";

/**
 * `create-next-app`'s own `globals.css` hardcodes `--background`/`--foreground` as literal
 * values (in `:root` and a dark-media-query duplicate) and a plain `body` rule with a
 * hardcoded font. All of it now sits *after* the contract's imports and wins: an unlayered
 * declaration always beats one inside `@layer` regardless of source order, and a repeated
 * custom property takes its last declaration. `shadcn init` only ever prepends its own
 * `@import`s to this file and never touches the rest — verified with `git diff` against
 * `create-next-app`'s own commit during this feature's throwaway-project run — so `kit
 * init` cleans up what's left: keep the imports, keep any real `--font-*` mapping (the
 * contract doesn't supply one; a project's own is genuinely needed), drop everything else.
 */
function cleanTailwindCss(cwd: string): void {
  const file = tailwindCssPath(cwd);
  const content = readFileSync(file, "utf8");
  const imports = (content.match(/^@import[^\n]*/gm) ?? []).join("\n");
  const fontLines = [...content.matchAll(/^\s*(--font-[a-z0-9-]+:[^;]*;)\s*$/gm)].map((match) => `  ${match[1]}`);
  const theme = fontLines.length ? `\n\n@theme inline {\n${fontLines.join("\n")}\n}\n` : "\n";
  writeFileSync(file, `${imports}${theme}`);
}

/**
 * `shadcn init` adds `@ja3dan/eslint-plugin` to `package.json` (the `setup` item's own
 * dependency list) but has no way to know a fresh project's `eslint.config.mjs` shape, so
 * it never wires the plugin in — meaning `no-raw-colors` is installed but not actually
 * running. Verified during this feature's throwaway-project run: a fresh project's config
 * is `create-next-app`'s own default (`eslint-config-next/core-web-vitals` +
 * `/typescript`, then a `globalIgnores([...])` call) — matched here, not guessed at.
 * A config that doesn't match that shape, or already mentions the plugin, is left alone.
 */
function wireEslintPlugin(cwd: string): void {
  const file = path.join(cwd, "eslint.config.mjs");
  if (!existsSync(file)) return;
  let content = readFileSync(file, "utf8");
  if (content.includes("@ja3dan/eslint-plugin")) return;

  const lastImport = [...content.matchAll(/^import[^\n]*\n/gm)].pop();
  if (!lastImport?.index) return;
  const importEnd = lastImport.index + lastImport[0].length;
  content = `${content.slice(0, importEnd)}import ja3dan from "@ja3dan/eslint-plugin";\n${content.slice(importEnd)}`;

  const entry = '  { ...ja3dan.configs.recommended, files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"] },\n';
  const globalIgnoresCall = content.indexOf("globalIgnores(");
  const closeArray = content.lastIndexOf("]);");
  const insertAt = globalIgnoresCall !== -1 ? globalIgnoresCall : closeArray;
  if (insertAt === -1) return;
  content = `${content.slice(0, insertAt)}${entry}  ${content.slice(insertAt)}`;
  writeFileSync(file, content);
}

/**
 * `skills/feature/SKILL.md` (installed by this same command) hardcodes `bun run check` in
 * its finish step. `create-next-app` never defines one — verified against a fresh
 * project's `package.json`, which has only `dev`/`build`/`start`/`lint` — so the skill it
 * just installed would fail on the very check it asks for. Left alone if already present.
 */
function ensureCheckScript(cwd: string): void {
  const file = path.join(cwd, "package.json");
  const manifest = JSON.parse(readFileSync(file, "utf8")) as { scripts?: Record<string, string> };
  if (manifest.scripts?.check) return;
  manifest.scripts = { ...manifest.scripts, check: "tsc --noEmit && eslint ." };
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

type InitResult = { templateFiles: string[]; skills: string[]; lock: Lock };

/**
 * The deterministic half of kickoff: copy the template into `context/`, install the
 * lifecycle skills into `.claude/skills/`, run `shadcn init` against the registry's `setup`
 * item, then lock both the registry items that leaves installed and the skills just copied
 * in. Order matters — `shadcn init` is what gives `components.json` the `@ja3dan` entry
 * `kit lock` (called last) needs to find.
 */
async function init(cwd: string, preset: string, { url = DEFAULT_REGISTRY }: { url?: string } = {}): Promise<InitResult> {
  if (readLock(cwd)) {
    throw new Error(`${LOCK_FILE} already exists in ${cwd}. kit init is for a project that hasn't been set up yet.`);
  }

  let template: ReturnType<typeof readTemplate>;
  try {
    template = readTemplate(preset);
  } catch {
    throw new Error(`No template named "${preset}". kit ships "next16-insforge" today.`);
  }
  for (const file of template) {
    const dest = path.join(cwd, "context", file.path);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, file.content);
  }

  const skills = readSkills();
  for (const skill of skills) {
    const dest = path.join(cwd, ".claude", "skills", skill.name, "SKILL.md");
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, skill.content);
  }

  await initProject(cwd, `${url.replace(/\/$/, "")}/r/setup.json`);
  cleanTailwindCss(cwd);
  wireEslintPlugin(cwd);
  ensureCheckScript(cwd);

  const { lock: itemLock } = await lock(cwd);
  const skillEntries: Record<string, SkillEntry> = Object.fromEntries(
    skills.map((skill) => [
      skill.name,
      {
        source: "@ja3dan/kit",
        sourceType: "kit" as const,
        version: pkg.version,
        computedHash: createHash("sha256").update(skill.content).digest("hex"),
      },
    ]),
  );
  const finalLock: Lock = { ...itemLock, skills: skillEntries };
  writeLock(cwd, finalLock);

  return { templateFiles: template.map((file) => file.path), skills: skills.map((skill) => skill.name), lock: finalLock };
}

export { DEFAULT_REGISTRY, init, type InitResult };
