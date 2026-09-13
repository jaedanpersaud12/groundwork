import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import ja3dan from "@ja3dan/eslint-plugin";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { ...ja3dan.configs.recommended, files: ["app/**/*.{ts,tsx}", "registry/**/*.{ts,tsx}"] },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "public/r/**"]),
]);

export default eslintConfig;
