import contract from "@ja3dan/tokens/contract.json" with { type: "json" };

const CONTRACT_TOKENS = new Set(Object.keys(contract.tokens));

const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|taupe|mauve|mist|olive";
const PALETTE_CLASS = new RegExp(`^(?:${PALETTE})-(?:50|[1-9]00|950)$`);
const COLOR_UTILITY =
  /^(bg|text|border(?:-[xytrblse])?|outline|ring(?:-offset)?|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow|inset-shadow|drop-shadow)-(.+)$/;
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const COLOR_FUNCTION = /^(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(/i;
const VAR_REFERENCE = /^(?:var\()?--([a-z0-9-]+)\)?$/i;

/** Strips variants (`hover:`, `data-[state=open]:`), important markers and a leading minus. */
function utilityOf(className) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < className.length; i++) {
    const char = className[i];
    if (char === "[" || char === "(") depth++;
    else if (char === "]" || char === ")") depth--;
    else if (char === ":" && depth === 0) start = i + 1;
  }
  return className.slice(start).replace(/^!|!$/g, "").replace(/^-/, "");
}

/** Removes an opacity modifier: `primary/50`, `primary/[0.35]`. */
function withoutOpacity(value) {
  const slash = value.lastIndexOf("/");
  if (slash === -1 || value.slice(0, slash).includes("[")) {
    return value.startsWith("[") ? value.replace(/\]\/.*$/, "]") : value;
  }
  return value.slice(0, slash);
}

/**
 * @returns {null | { messageId: string, data: Record<string, string> }}
 */
export function checkClass(className, allowedTokens) {
  const utility = utilityOf(className);
  const match = COLOR_UTILITY.exec(utility);
  if (!match) return null;
  const value = withoutOpacity(match[2]);

  const bracketed = /^[[(](.*)[\])]$/.exec(value);
  if (bracketed) {
    const inner = bracketed[1].replace(/^color:/, "");
    if (HEX.test(inner) || COLOR_FUNCTION.test(inner)) {
      return { messageId: "arbitrary", data: { className } };
    }
    const reference = VAR_REFERENCE.exec(inner);
    if (reference && !allowedTokens.has(reference[1])) {
      return { messageId: "unknownVar", data: { className, token: reference[1] } };
    }
    return null;
  }

  if (PALETTE_CLASS.test(value) || value === "black" || value === "white") {
    return { messageId: "palette", data: { className } };
  }
  return null;
}

/** @type {import("eslint").Rule.RuleModule} */
const noRawColors = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow hex values, arbitrary colours and Tailwind palette classes. Use token-contract utilities instead.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowTokens: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      palette:
        "`{{className}}` is a raw Tailwind palette colour. Use a token utility (see @ja3dan/tokens/TOKENS.md).",
      arbitrary:
        "`{{className}}` hardcodes a colour. Use a token utility (see @ja3dan/tokens/TOKENS.md).",
      unknownVar:
        "`{{className}}` references --{{token}}, which is not in the token contract or allowTokens.",
      hex: "`{{value}}` is a hardcoded colour. Reference a token instead (for example `var(--primary)`).",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const allowedTokens = new Set([...CONTRACT_TOKENS, ...(options.allowTokens ?? [])]);

    function checkText(node, text) {
      const trimmed = text.trim();
      if (HEX.test(trimmed) || COLOR_FUNCTION.test(trimmed)) {
        context.report({ node, messageId: "hex", data: { value: trimmed } });
        return;
      }
      for (const className of text.split(/\s+/)) {
        if (!className) continue;
        const problem = checkClass(className, allowedTokens);
        if (problem) context.report({ node, ...problem });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") checkText(node, node.value);
      },
      TemplateElement(node) {
        checkText(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};

const plugin = {
  meta: { name: "@ja3dan/eslint-plugin", version: "0.1.0" },
  rules: { "no-raw-colors": noRawColors },
  configs: {},
};

plugin.configs.recommended = {
  files: ["**/*.{js,jsx,ts,tsx}"],
  plugins: { "@ja3dan": plugin },
  rules: { "@ja3dan/no-raw-colors": "error" },
};

export default plugin;
