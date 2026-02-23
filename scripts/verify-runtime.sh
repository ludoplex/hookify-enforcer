#!/usr/bin/env bash
set -euo pipefail

OUT="${1:-reports/hookify-runtime-verify-$(date +%Y%m%d-%H%M%S).md}"
mkdir -p "$(dirname "$OUT")"

if [ -n "${HOME-}" ]; then
  DEFAULT_STAMP_PATH="$HOME/.openclaw/workspace/.enforcer/hookify-verified.json"
else
  DEFAULT_STAMP_PATH="/tmp/.openclaw/workspace/.enforcer/hookify-verified.json"
fi
STAMP_FILE="${2:-${HOOKIFY_VERIFICATION_STAMP_PATH:-$DEFAULT_STAMP_PATH}}"
STAMP_DIR="$(dirname "$STAMP_FILE")"

DOCTOR_OK=true
PLUGINS_OK=true
HOOKS_OK=true

PLUGIN_INFO=$(openclaw plugins info hookify-enforcer 2>&1) || PLUGIN_INFO="(plugin info failed)"
DOCTOR_OUT=$(openclaw doctor --non-interactive 2>&1) || DOCTOR_OK=false
PLUGINS_DOCTOR_OUT=$(openclaw plugins doctor 2>&1) || PLUGINS_OK=false
HOOKS_CHECK_OUT=$(openclaw hooks check 2>&1) || HOOKS_OK=false

{
  echo "# Hookify Runtime Verification"
  echo
  echo "Generated: $(date -Is)"
  echo
  echo "## 1) Plugin discovery"
  echo "$PLUGIN_INFO"
  echo
  echo "## 2) Doctor snapshot"
  echo "$DOCTOR_OUT"
  echo
  echo "## 3) Hook registration check"
  echo "$PLUGIN_INFO" | grep -E "Hooks:" || true
  echo
  echo "## 4) Runtime probe (direct CLI exec path)"
  TMPF=$(mktemp /tmp/hookify_runtime_probe.XXXXXX)
  set +e
  echo PROBE > "$TMPF"
  RC=$?
  set -e
  if [ $RC -eq 0 ]; then
    echo "- direct shell write succeeded (this path may bypass agent hook enforcement)"
  else
    echo "- direct shell write blocked (rc=$RC)"
  fi
  rm -f "$TMPF"
  echo
  echo "## 4b) Runtime probe caveat"
  echo "- Direct shell probes validate OS-level write behavior, not agent hook interception path."
  echo "- Representative OpenClaw command executed for context:"
  echo "$PLUGIN_INFO" | sed -n "1,5p"
  echo
  echo "## 5) Conclusion"
  if [ "$DOCTOR_OK" = true ] && [ "$PLUGINS_OK" = true ] && [ "$HOOKS_OK" = true ]; then
    echo "- Verification checks passed."
    echo "- Writing verification stamp to: $STAMP_FILE"
  else
    echo "- Verification checks failed."
    echo "- doctorOk=$DOCTOR_OK pluginsDoctorOk=$PLUGINS_OK hooksCheckOk=$HOOKS_OK"
    echo "- Stamp will NOT be written."
  fi
} > "$OUT"

echo "$OUT"

if [ "$DOCTOR_OK" = true ] && [ "$PLUGINS_OK" = true ] && [ "$HOOKS_OK" = true ]; then
  mkdir -p "$STAMP_DIR"
  python3 - <<PY2
import json, time
from pathlib import Path
Path("$STAMP_FILE").write_text(json.dumps({
  "verifiedAtEpochSec": int(time.time()),
  "doctorOk": True,
  "pluginsDoctorOk": True,
  "hooksCheckOk": True
}, indent=2))
print("stamp written:", "$STAMP_FILE")
PY2
else
  echo "verification failed; skipping stamp write" >&2
  exit 1
fi
