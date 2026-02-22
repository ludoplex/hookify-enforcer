#!/usr/bin/env bash
set -euo pipefail
PASS=0
FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
no(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

# strict-mode schema keys must exist
if jq -e '.configSchema.properties.strictMode and .configSchema.properties.strictAllowedExecRegexes and .configSchema.properties.strictRequireDoctorOk and .configSchema.properties.strictRequirePluginsDoctorOk and .configSchema.properties.strictRequireHooksCheckOk' openclaw.plugin.json >/dev/null 2>&1; then
  ok "manifest strict-mode schema"
else
  no "manifest strict-mode schema"
fi

# code-level strict-mode gate must exist
if grep -q "strictMode" index.ts \
  && grep -q "strictAllowedExecRegexes" index.ts \
  && grep -q "strictRequireDoctorOk" index.ts \
  && grep -q "strictRequirePluginsDoctorOk" index.ts \
  && grep -q "strictRequireHooksCheckOk" index.ts; then
  ok "strict-mode logic present"
else
  no "strict-mode logic present"
fi

# verify script must emit rich verification flags used by strict mode
if grep -q "doctorOk" scripts/verify-runtime.sh \
  && grep -q "pluginsDoctorOk" scripts/verify-runtime.sh \
  && grep -q "hooksCheckOk" scripts/verify-runtime.sh; then
  ok "verify-runtime emits strict flags"
else
  no "verify-runtime emits strict flags"
fi

echo "---"
echo "TOTAL_PASS=$PASS"
echo "TOTAL_FAIL=$FAIL"
[[ $FAIL -eq 0 ]]
