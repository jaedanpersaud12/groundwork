/**
 * Bundled by scripts/build.ts into ../validate.js, exported as @ja3dan/tokens/validate.
 * `bun build` inlines contract.json as a literal, so the output has no runtime JSON import
 * and works on any consumer's Node version, not just Bun's.
 */
export { declaredIn, requiredTokens, shadows, tokenNames, tokens, typography } from "./contract";
