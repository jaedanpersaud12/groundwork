import contract from "../contract.json";

export type TokenSpec = { group: string; required: boolean; role: string };

export const tokens = contract.tokens as Record<string, TokenSpec>;
export const tokenNames = Object.keys(tokens);
export const requiredTokens = tokenNames.filter((name) => tokens[name].required);
export const radius = contract.radius;
export const shadows = contract.shadows as Record<string, { required: boolean; role: string }>;
export const typography = contract.typography as Record<string, { required: boolean; role: string }>;
export const contractVersion = contract.version;

/** Custom properties declared directly inside a top-level `selector { ... }` block. */
export function declaredIn(css: string, selector: string): Set<string> {
  const names = new Set<string>();
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blocks = css.matchAll(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`, "g"));
  for (const block of blocks) {
    for (const match of block[1].matchAll(/--([a-z0-9-]+)\s*:/g)) names.add(match[1]);
  }
  return names;
}
