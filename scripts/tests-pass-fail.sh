#!/usr/bin/env bash
set -euo pipefail

PASS=0
FAIL=0

ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
no(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

# 1) verify-runtime script syntax
if bash -n scripts/verify-runtime.sh; then ok "verify-runtime.sh syntax"; else no "verify-runtime.sh syntax"; fi

# 2) verify-runtime generates report
REPORT="reports/test-runtime-$(date +%Y%m%d-%H%M%S).md"
if scripts/verify-runtime.sh "$REPORT" >/tmp/hookify_test_out.txt 2>&1; then
  if [[ -f "$REPORT" ]] && grep -q "## 1) Plugin discovery" "$REPORT"; then
    ok "verify-runtime report generation"
  else
    no "verify-runtime report generation"
  fi
else
  no "verify-runtime execution"
fi

# 3) verification stamp exists and is numeric
STAMP="/home/user/.openclaw/workspace/.enforcer/hookify-verified.json"
if [[ -f "$STAMP" ]] && jq -e '.verifiedAtEpochSec|numbers' "$STAMP" >/dev/null 2>&1; then
  ok "verification stamp emitted"
else
  no "verification stamp emitted"
fi

# 4) manifest contains spawn verification keys
if jq -e '.configSchema.properties.requireVerificationForSpawn and .configSchema.properties.verificationStampPath and .configSchema.properties.verificationMaxAgeSec' openclaw.plugin.json >/dev/null; then
  ok "manifest includes spawn verification schema"
else
  no "manifest includes spawn verification schema"
fi

# 5) plugin contains hook registrations and spawn gate logic
if grep -q "hookify-before-tool-call" index.ts \
  && grep -q "hookify-before-message-write" index.ts \
  && grep -q "event.toolName === \"sessions_spawn\"" index.ts; then
  ok "plugin includes tool/message hooks and spawn gate"
else
  no "plugin includes tool/message hooks and spawn gate"
fi

echo "---"
echo "TOTAL_PASS=$PASS"
echo "TOTAL_FAIL=$FAIL"
[[ $FAIL -eq 0 ]]
