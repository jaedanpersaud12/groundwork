import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * `kit init` needs its own copies of `skills/` and `templates/` at runtime. Published, they
 * sit next to the compiled `dist/kit.js` (a build step copies them there before `bun build`
 * runs — see `package.json`'s `build` script). Running from source inside this monorepo —
 * every other command in this session is tested that way — they don't exist yet, so this
 * falls back to the monorepo root three directories up from `src/`.
 */
function resolveAssetsRoot(): string {
  const compiled = path.dirname(fileURLToPath(import.meta.url));
  if (existsSync(path.join(compiled, "skills"))) return compiled;
  return path.join(compiled, "..", "..", "..");
}

type SkillFile = { name: string; content: string };

/** The lifecycle skills kickoff installs — `AGENTS.md`'s map, not groundwork's own vendored ones. */
function readSkills(): SkillFile[] {
  const root = path.join(resolveAssetsRoot(), "skills");
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, content: readFileSync(path.join(root, entry.name, "SKILL.md"), "utf8") }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

type TemplateFile = { path: string; content: string };

/** Every file a preset copies, relative to its own root, in the shape `kit init` writes them. */
function readTemplate(preset: string): TemplateFile[] {
  const root = path.join(resolveAssetsRoot(), "templates", preset);
  const walk = (dir: string): TemplateFile[] =>
    readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
      const rel = dir ? `${dir}/${entry.name}` : entry.name;
      return entry.isDirectory() ? walk(rel) : [{ path: rel, content: readFileSync(path.join(root, rel), "utf8") }];
    });
  return walk("");
}

export { readSkills, readTemplate, resolveAssetsRoot, type SkillFile, type TemplateFile };
