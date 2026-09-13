#!/usr/bin/env bash
# PreToolUse(Write|Edit): refuse edits to files generated from contract.json.
# Invariant #1 in AGENTS.md. Prose did not hold it; this does.
f=$(jq -r '.tool_input.file_path // ""')
case "$f" in
  */packages/tokens/theme.css|*/packages/tokens/TOKENS.md)
    jq -nc --arg f "${f##*/}" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ($f + " is generated from packages/tokens/contract.json and is overwritten by `bun run tokens`. Edit contract.json and regenerate. See the token-change skill.")
      }
    }'
    ;;
esac
