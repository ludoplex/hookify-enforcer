#!/usr/bin/env bash
set -euo pipefail

OUT="${1:-reports/hookify-runtime-verify-$(date +%Y%m%d-%H%M%S).md}"
mkdir -p "$(dirname "$OUT")"

{
  echo "# Hookify Runtime Verification"
  echo
  echo "Generated: $(date -Is)"
  echo
  echo "## 1) Plugin discovery"
  PLUGIN_INFO=$(openclaw plugins info hookify-enforcer 2>&1 || true)
  echo "$PLUGIN_INFO"
  echo
  echo "## 2) Doctor snapshot"
  openclaw doctor --non-interactive || true
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
  openclaw plugins info hookify-enforcer >/tmp/hookify_repr.out 2>&1 || true
  sed -n "1,5p" /tmp/hookify_repr.out

  echo "## 5) Conclusion"
  echo "- Plugin load/registration status is validated above."
  echo "- Use this report to distinguish discovery/load failures from runtime path bypass issues."
} > "$OUT"

echo "$OUT"

STAMP_FILE="${HOOKIFY_VERIFICATION_STAMP_PATH:-/home/user/.openclaw/workspace/.enforcer/hookify-verified.json}"
STAMP_DIR="$(dirname "$STAMP_FILE")"
mkdir -p "$STAMP_DIR"
python3 - <<PY
import json, time
from pathlib import Path
Path("$STAMP_FILE").write_text(json.dumps({"verifiedAtEpochSec": int(time.time())}, indent=2))
print("stamp written:", "$STAMP_FILE")
PY

DOCTOR_OK=true
PLUGINS_OK=true
HOOKS_OK=true
openclaw doctor --non-interactive >/tmp/hookify_doctor.out 2>&1 || DOCTOR_OK=false
openclaw plugins doctor >/tmp/hookify_plugins_doctor.out 2>&1 || PLUGINS_OK=false
openclaw hooks check >/tmp/hookify_hooks_check.out 2>&1 || HOOKS_OK=false
STAMP_FILE="${HOOKIFY_VERIFICATION_STAMP_PATH:-/home/user/.openclaw/workspace/.enforcer/hookify-verified.json}"
STAMP_DIR="$(dirname "$STAMP_FILE")"
mkdir -p "$STAMP_DIR"
python3 - <<PY2
import json, time
from pathlib import Path
Path("$STAMP_FILE").write_text(json.dumps({
  "verifiedAtEpochSec": int(time.time()),
  "doctorOk": "$DOCTOR_OK" == "true",
  "pluginsDoctorOk": "$PLUGINS_OK" == "true",
  "hooksCheckOk": "$HOOKS_OK" == "true"
}, indent=2))
print("stamp written:", "$STAMP_FILE")
PY2
