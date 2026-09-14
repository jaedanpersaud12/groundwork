/**
 * `@ja3dan/eslint-plugin` and `@ja3dan/tokens/validate` are plain JS with no shipped
 * declarations. These describe only what `kit` actually calls.
 */
declare module "@ja3dan/eslint-plugin" {
  import type { Linter } from "eslint";

  const plugin: {
    meta: { name: string; version: string };
    rules: Record<string, unknown>;
    configs: { recommended: Linter.Config };
  };
  export default plugin;
}

declare module "@ja3dan/tokens/validate" {
  export const requiredTokens: string[];
  export const shadows: Record<string, { required: boolean; role: string }>;
  export function declaredIn(css: string, selector: string): Set<string>;
}
