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

## Templating and Auto-Scaffolding (Boilerplate Minimization)

This repository now includes three boilerplate minimization paths:

1. **Cookiecutter template**
   - Config: `/tmp/hookify-enforcer/cookiecutter.json`
   - Template root: `/tmp/hookify-enforcer/cookiecutter-plugin-template/`

2. **Copier template**
   - Config: `/tmp/hookify-enforcer/copier.yml`
   - Template root: `/tmp/hookify-enforcer/copier-template/`

3. **TypeScript policy scaffolder**
   - Script: `/tmp/hookify-enforcer/scripts/scaffold-ts.mjs`
   - Templates: `/tmp/hookify-enforcer/templates/policy/`
   - NPM script: `npm run scaffold:policy --name=<policy-name>`

### Examples

```bash
# Cookiecutter
cookiecutter /tmp/hookify-enforcer/cookiecutter-plugin-template

# Copier
copier copy /tmp/hookify-enforcer /tmp/new-plugin

# TS scaffold inside repo
npm run scaffold:policy --name=a2a-enforcement
```
