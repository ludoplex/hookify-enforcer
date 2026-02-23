# Hookify Enforcer Spec (TDD)

## Scope
Plugin-level hard enforcement for:
1. `before_tool_call` (exec + sessions_spawn)
2. `before_message_write` (content/regex blocking)

## Strict Mode Contract
When `strictMode=true`, `exec` calls are blocked unless:
- verification stamp exists and is fresh
- required flags are true per config: `doctorOk`, `pluginsDoctorOk`, `hooksCheckOk`
- OR command matches `strictAllowedExecRegexes`

## Spawn Verification Contract
When `requireVerificationForSpawn=true`, `sessions_spawn` is blocked unless stamp is fresh.

## OpSeq Contract
For guarded mutation flow:
- `read-mark` records timestamp
- `append`/`insert-after` requires valid read mark within TTL
- cooldown blocks repeated mutations within cooldown window

## Message Contract
`before_message_write` blocks when content matches block regexes unless allow regex matches first.

## Edge Cases
- missing stamp file
- malformed stamp JSON
- stale stamp
- regex compile/usage path for allowed/block lists
- no command param
