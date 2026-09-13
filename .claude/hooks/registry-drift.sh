#!/usr/bin/env bash
# Stop: warn when a registry item's source changed but its version or its example
# did not. Both drift silently — the build only catches a version that moved
# without matching a published copy, never one that failed to move at all.
cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
changed=$(git status --porcelain -- apps/registry/registry/groundwork 2>/dev/null)
[ -n "$changed" ] || exit 0

warn=""
git status --porcelain -- apps/registry/registry.json | grep -q . \
  || warn="registry.json is unchanged, so no meta.version moved"
git status --porcelain -- apps/registry/app/examples | grep -q . \
  || warn="${warn:+$warn; }no example under apps/registry/app/examples changed"

[ -n "$warn" ] || exit 0
items=$(printf '%s\n' "$changed" | sed 's|.*/||' | paste -sd' ' -)
jq -nc --arg items "$items" --arg warn "$warn" '{
  systemMessage: ("Registry drift — edited: " + $items + ". But " + $warn + ". Bump meta.version for any content change (it is the merge base kit sync relies on) and add or update the example.")
}'
