#!/usr/bin/env bash
# PostToolUse(Write|Edit): run no-raw-colors on an edited registry source, so a raw
# colour surfaces at the edit rather than at `bun run check` twenty minutes later.
f=$(jq -r '.tool_response.filePath // .tool_input.file_path // ""')
case "$f" in
  */apps/registry/registry/*.ts|*/apps/registry/registry/*.tsx) ;;
  *) exit 0 ;;
esac
root="${f%%/apps/registry/*}/apps/registry"
out=$(cd "$root" && bunx eslint "$f" 2>&1) || {
  jq -nc --arg out "$out" '{
    decision: "block",
    reason: ("eslint failed on the file just edited:\n" + $out + "\nFix it before moving on — registry items must use contract tokens only.")
  }'
}
exit 0
