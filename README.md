# openclaw-plugin-hookify-enforcer

OpenClaw plugin that enforces hard tool-call sequencing for file mutation via `before_tool_call`.

## What it enforces

- Mutation-like `exec` commands are blocked unless using guarded sequence.
- Required sequence:
  1. `opseq_guard.py read-mark <file>`
  2. `opseq_guard.py append ...` or `opseq_guard.py insert-after ...`
- Read-mark TTL and cooldown are enforced via env vars:
  - `OPSEQ_READ_TTL_SEC` (default: 1800)
  - `OPSEQ_COOLDOWN_SEC` (default: 20)

## Plugin files

- `openclaw.plugin.json`
- `index.ts`

## License

MIT
