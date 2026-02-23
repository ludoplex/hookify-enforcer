# hookify-enforcer

`hookify-enforcer` is an OpenClaw plugin that registers `before_tool_call` and `before_message_write` hooks to enforce configurable guardrails.

## Current behavior

### `before_tool_call` (`exec`)
- Tracks guarded file mutations through `opseq_guard.py` operations.
- Requires a fresh read-mark before configured mutate operations (`append`, `insert-after` by default).
- Applies per-file cooldown between mutate operations.
- Optionally enforces required regex conditions for all `exec` commands (`enforceAllExec` + `execRequireRegexes`).
- Blocks risky `exec` commands using configurable regex blocklists, with optional allowlist overrides.

### `before_message_write`
- Supports configurable message block/allow regexes.
- Supports configurable reasoning-text block regexes.

## State and config notes
- Default state file: `/home/user/.openclaw/workspace/.enforcer/opseq-state.json`
- Environment overrides:
  - `OPSEQ_READ_TTL_SEC` (default: `1800`)
  - `OPSEQ_COOLDOWN_SEC` (default: `20`)
- Plugin config schema is defined in `openclaw.plugin.json`.

## License
MIT
