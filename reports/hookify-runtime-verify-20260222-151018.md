# Hookify Runtime Verification

Generated: 2026-02-22T15:10:18-07:00

## 1) Plugin discovery
[plugins] hook runner initialized with 2 registered hooks
Hookify Hard Enforcer
id: hookify-enforcer
Configurable hard tool sequence enforcement using before_tool_call

Status: loaded
Source: ~/.openclaw/workspace/.openclaw/extensions/hookify-enforcer/index.ts
Origin: workspace
Version: 0.3.0
Hooks: hookify-before-tool-call, hookify-before-message-write

## 2) Doctor snapshot
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
██░▄▄▄░██░▄▄░██░▄▄▄██░▀██░██░▄▄▀██░████░▄▄▀██░███░██
██░███░██░▀▀░██░▄▄▄██░█░█░██░█████░████░▀▀░██░█░█░██
██░▀▀▀░██░█████░▀▀▀██░██▄░██░▀▀▄██░▀▀░█░██░██▄▀▄▀▄██
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                  🦞 OPENCLAW 🦞                    
 
┌  OpenClaw doctor
│
◇  Session locks ──────────────────────────────────────────────────────────────╮
│                                                                              │
│  - Found 1 session lock file.                                                │
│  - ~/.openclaw/agents/main/sessions/016b55fb-0233-4021-86cb-69ac0fc2d7ed.js  │
│  onl.lock                                                                    │
│    pid=2741298 (alive) age=27s stale=no                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────╯
│
◇  Security ─────────────────────────────────╮
│                                            │
│  - No channel security warnings detected.  │
│  - Run: openclaw security audit --deep     │
│                                            │
├────────────────────────────────────────────╯
│
◇  Skills status ────────────╮
│                            │
│  Eligible: 16              │
│  Missing requirements: 43  │
│  Blocked by allowlist: 0   │
│                            │
├────────────────────────────╯
[plugins] hook runner initialized with 2 registered hooks
│
◇  Plugins ──────╮
│                │
│  Loaded: 8     │
│  Disabled: 29  │
│  Errors: 0     │
│                │
├────────────────╯
Signal: failed (unknown) - fetch failed
Agents: main (default), ops, webdev, cosmo, social, course, pearsonvue, ggleap, asm, metaquest, neteng, roblox, cicd, testcov, seeker, sitecraft, skillsmith, ballistics, climbibm, analyst, statanalysis, android, apple, aws, dbeng, foresight, gcp, hindsight, ios, localsearch, msft, never-say-die, project-critic, project-manager, redundant-project-checker, zoho, dev, research
Heartbeat interval: 30m (main)
Session store (main): /home/user/.openclaw/agents/main/sessions/sessions.json (2 entries)
- agent:main:main (2m ago)
- agent:main:claude-code-import (1002m ago)
│
◇  Channel warnings ────────────────────────────────────────────────╮
│                                                                   │
│  - signal default: Channel error: signal daemon not ready (fetch  │
│    failed)                                                        │
│                                                                   │
├───────────────────────────────────────────────────────────────────╯
Run "openclaw doctor --fix" to apply changes.
│
└  Doctor complete.


## 3) Hook registration check
Hooks: hookify-before-tool-call, hookify-before-message-write

## 4) Runtime probe (direct CLI exec path)
- direct shell write succeeded (this path may bypass agent hook enforcement)

## 5) Conclusion
- Plugin load/registration status is validated above.
- Use this report to distinguish discovery/load failures from runtime path bypass issues.
