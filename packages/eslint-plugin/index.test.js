import { RuleTester } from "eslint";
import plugin from "./index.js";

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("no-raw-colors", plugin.rules["no-raw-colors"], {
  valid: [
    `<div className="bg-card text-muted-foreground border-border rounded-md px-4" />`,
    `<div className="hover:bg-accent data-[state=open]:bg-accent focus-visible:ring-ring/50" />`,
    `<div className="bg-primary/10 text-sm border-2 ring-1 shadow-sm outline-none" />`,
    `<div className="bg-[var(--primary)] text-(--muted-foreground) bg-transparent text-current" />`,
    `cn("bg-destructive-subtle text-destructive", cond && "text-success")`,
    { code: `<div className="bg-hero-blush" />`, options: [{ allowTokens: ["hero-blush"] }] },
    `<a href="#main">Skip</a>`,
    `const size = "text-2xl font-semibold";`,
  ],
  invalid: [
    { code: `<div className="bg-purple-500" />`, errors: [{ messageId: "palette" }] },
    { code: `<div className="hover:text-gray-600 p-2" />`, errors: [{ messageId: "palette" }] },
    { code: `<div className="text-white" />`, errors: [{ messageId: "palette" }] },
    { code: `<div className="bg-[#F6F7FB]" />`, errors: [{ messageId: "arbitrary" }] },
    { code: `<div className="border-[oklch(0.9_0_0)]/50" />`, errors: [{ messageId: "arbitrary" }] },
    { code: `<div className="bg-[var(--brand-pink)]" />`, errors: [{ messageId: "unknownVar" }] },
    { code: "cva(`inline-flex ${x} text-emerald-700`)", errors: [{ messageId: "palette" }] },
    { code: `<div style={{ color: "#7c5cfc" }} />`, errors: [{ messageId: "hex" }] },
  ],
});
