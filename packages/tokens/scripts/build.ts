/**
 * Generates theme.css and TOKENS.md from contract.json, then validates every theme.
 * Run with `bun run build` in this package. Never edit the generated files by hand.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { contractVersion, declaredIn, radius, requiredTokens, shadows, tokenNames, tokens, typography } from "./contract";

const root = join(import.meta.dir, "..");
const header = `/* Generated from contract.json v${contractVersion} by scripts/build.ts. Do not edit. */`;

const colorLines = tokenNames.map((name) => `  --color-${name}: var(--${name});`);
const radiusLines = Object.entries(radius.scale).map(
  ([step, factor]) => `  --radius-${step}: calc(var(--radius) * ${factor});`,
);

writeFileSync(
  join(root, "theme.css"),
  [
    header,
    "",
    "@custom-variant dark (&:is(.dark *));",
    "",
    "@theme inline {",
    ...colorLines,
    "",
    ...radiusLines,
    "",
    ...Object.keys(shadows).map((name) => `  --shadow-${name}: var(--depth-${name});`),
    "",
    ...Object.keys(typography).map((name) => `  --font-${name}: var(--typeface-${name}, var(--font-sans));`),
    "}",
    "",
  ].join("\n"),
);

const groups = new Map<string, string[]>();
for (const name of tokenNames) {
  const { group, required, role } = tokens[name];
  const rows = groups.get(group) ?? [];
  rows.push(`| \`${name}\` | ${required ? "yes" : "optional"} | ${role} |`);
  groups.set(group, rows);
}

writeFileSync(
  join(root, "TOKENS.md"),
  [
    `<!-- Generated from contract.json v${contractVersion}. Do not edit. -->`,
    "# Token contract",
    "",
    "Components use only these names, as Tailwind utilities (`bg-card`, `text-muted-foreground`, `border-border`, `ring-ring`).",
    "Never hex values, arbitrary colours (`bg-[#fff]`) or palette classes (`text-gray-500`).",
    "",
    "Opacity modifiers are allowed (`bg-primary/10`). Radius comes from `rounded-xs` … `rounded-xl`, scaled from `--radius`.",
    "",
    ...[...groups].flatMap(([group, rows]) => [
      `## ${group}`,
      "",
      "| Token | Required | Role |",
      "| --- | --- | --- |",
      ...rows,
      "",
    ]),
    "## shadows",
    "",
    "Themes define `--depth-<name>`; use as `shadow-<name>`.",
    "",
    "| Utility | Required | Role |",
    "| --- | --- | --- |",
    ...Object.entries(shadows).map(([name, spec]) => `| \`shadow-${name}\` | ${spec.required ? "yes" : "optional"} | ${spec.role} |`),
    "",
    "## typography",
    "",
    "| Utility | Required | Role |",
    "| --- | --- | --- |",
    ...Object.entries(typography).map(([name, spec]) => `| \`font-${name}\` | ${spec.required ? "yes" : "optional"} | ${spec.role} |`),
    "",
    "## utilities",
    "",
    "`scroll-slim` (from base.css): a hairline scrollbar in the foreground colour for scrolling panels and tables.",
    "",
  ].join("\n"),
);

let failed = false;
const themesDir = join(root, "themes");
for (const file of readdirSync(themesDir).filter((f) => f.endsWith(".css"))) {
  const css = readFileSync(join(themesDir, file), "utf8");
  let fileFailed = false;
  for (const selector of [":root", ".dark"]) {
    const declared = declaredIn(css, selector);
    const missing = [
      ...requiredTokens.filter((name) => !declared.has(name)),
      ...Object.entries(shadows)
        .filter(([name, spec]) => spec.required && !declared.has(`depth-${name}`))
        .map(([name]) => `depth-${name}`),
    ];
    if (!declared.has("radius") && selector === ":root") missing.push("radius");
    const unknown = [...declared].filter(
      (name) =>
        name !== "radius" &&
        !name.startsWith("font-") &&
        !(name.startsWith("typeface-") && typography[name.slice("typeface-".length)]) &&
        !(name.startsWith("depth-") && shadows[name.slice("depth-".length)]) &&
        !tokens[name],
    );
    if (missing.length) {
      fileFailed = true;
      console.error(`✗ themes/${file} ${selector} is missing: ${missing.join(", ")}`);
    }
    if (unknown.length) {
      fileFailed = true;
      console.error(`✗ themes/${file} ${selector} declares tokens outside the contract: ${unknown.join(", ")}`);
    }
  }
  if (fileFailed) failed = true;
  else console.log(`✓ themes/${file}`);
}

const bundled = await Bun.build({ entrypoints: [join(root, "scripts/validate-entry.ts")], target: "node" });
if (!bundled.success) {
  failed = true;
  for (const message of bundled.logs) console.error(message);
} else {
  writeFileSync(join(root, "validate.js"), await bundled.outputs[0].text());
}

console.log(`Generated theme.css, TOKENS.md and validate.js (${tokenNames.length} tokens, contract v${contractVersion}).`);
if (failed) process.exit(1);
