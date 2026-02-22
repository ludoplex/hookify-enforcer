import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import register from '../index.ts';

type HookMap = Record<string, (event: any) => any>;

function setup(pluginConfig: Record<string, unknown> = {}) {
  const hooks: HookMap = {};
  const api = {
    pluginConfig,
    registerHook: (name: string, handler: any) => {
      hooks[name] = handler;
    },
  };
  register(api as any);
  return hooks;
}

const stampPath = '/home/user/.openclaw/workspace/.enforcer/hookify-verified.json';
const statePath = '/home/user/.openclaw/workspace/.enforcer/opseq-state.json';

function writeStamp(obj: any) {
  fs.mkdirSync(path.dirname(stampPath), { recursive: true });
  fs.writeFileSync(stampPath, JSON.stringify(obj), 'utf8');
}

beforeEach(() => {
  try { fs.unlinkSync(stampPath); } catch {}
  try { fs.unlinkSync(statePath); } catch {}
});

describe('strict mode', () => {
  it('blocks exec when stamp missing and command not strict-allowed', () => {
    const hooks = setup({ strictMode: true, verificationStampPath: stampPath });
    const out = hooks.before_tool_call({ toolName: 'exec', params: { command: 'echo hi' } });
    expect(out?.block).toBe(true);
  });

  it('allows strict-allowed command even when stamp missing', () => {
    const hooks = setup({ strictMode: true, verificationStampPath: stampPath, strictAllowedExecRegexes: ['^echo\\b'] });
    const out = hooks.before_tool_call({ toolName: 'exec', params: { command: 'echo hi' } });
    expect(out).toBeUndefined();
  });

  it('allows exec when stamp fresh and all required flags true', () => {
    writeStamp({ verifiedAtEpochSec: Math.floor(Date.now()/1000), doctorOk: true, pluginsDoctorOk: true, hooksCheckOk: true });
    const hooks = setup({ strictMode: true, verificationStampPath: stampPath });
    const out = hooks.before_tool_call({ toolName: 'exec', params: { command: 'uname -a' } });
    expect(out).toBeUndefined();
  });
});

describe('sessions_spawn verification', () => {
  it('blocks sessions_spawn when verification is stale', () => {
    writeStamp({ verifiedAtEpochSec: 1, doctorOk: true, pluginsDoctorOk: true, hooksCheckOk: true });
    const hooks = setup({ requireVerificationForSpawn: true, verificationStampPath: stampPath, verificationMaxAgeSec: 1 });
    const out = hooks.before_tool_call({ toolName: 'sessions_spawn', params: {} });
    expect(out?.block).toBe(true);
  });
});

describe('opseq', () => {
  it('blocks append without read-mark', () => {
    const hooks = setup({ enforceAllExec: false });
    const out = hooks.before_tool_call({ toolName: 'exec', params: { command: 'python3 /home/user/.openclaw/workspace/scripts/opseq_guard.py append /tmp/a.txt x' } });
    expect(out?.block).toBe(true);
  });
});

describe('message blocking', () => {
  it('blocks message matching block regex', () => {
    const hooks = setup({ messageBlockRegexes: ['forbidden-token'] });
    const out = hooks.before_message_write({ message: { content: 'this contains forbidden-token' } });
    expect(out?.block).toBe(true);
  });

  it('allows message when allow regex matches first', () => {
    const hooks = setup({ messageBlockRegexes: ['forbidden-token'], messageAllowRegexes: ['^whitelist:'] });
    const out = hooks.before_message_write({ message: { content: 'whitelist: forbidden-token' } });
    expect(out).toBeUndefined();
  });
});
