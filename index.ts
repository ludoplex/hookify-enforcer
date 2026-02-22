import fs from "node:fs";
import path from "node:path";

type Cfg = {
  enabled: boolean;
  guardToolPattern: string;
  readMarkOp: string;
  mutateOps: string[];
  readTtlSec: number;
  cooldownSec: number;
  blockedExecRegexes: string[];
  allowExecRegexes: string[];
};

const ROOT = "/home/user/.openclaw/workspace";
const STATE_DIR = path.join(ROOT, ".enforcer");
const STATE_FILE = path.join(STATE_DIR, "opseq-state.json");

const DEFAULT_BLOCKLIST = [
  "\\brm\\b",
  "\\bmv\\b",
  "\\btruncate\\b",
  "\\bsed\\b\\s+-i\\b",
  "\\bperl\\b\\s+-i\\b",
  "\\becho\\b.*>",
  "\\bcat\\b.*>",
  ">\\s*[^|\\s]+"
];

function cfgFromPlugin(pluginConfig: Record<string, unknown> | undefined): Cfg {
  const pc = pluginConfig ?? {};
  const envTtl = Number(process.env.OPSEQ_READ_TTL_SEC || "1800");
  const envCooldown = Number(process.env.OPSEQ_COOLDOWN_SEC || "20");
  return {
    enabled: (pc.enabled as boolean | undefined) ?? true,
    guardToolPattern: (pc.guardToolPattern as string | undefined) ?? "opseq_guard\\.py",
    readMarkOp: (pc.readMarkOp as string | undefined) ?? "read-mark",
    mutateOps: (pc.mutateOps as string[] | undefined) ?? ["append", "insert-after"],
    readTtlSec: Number((pc.readTtlSec as number | undefined) ?? envTtl),
    cooldownSec: Number((pc.cooldownSec as number | undefined) ?? envCooldown),
    blockedExecRegexes: (pc.blockedExecRegexes as string[] | undefined) ?? DEFAULT_BLOCKLIST,
    allowExecRegexes: (pc.allowExecRegexes as string[] | undefined) ?? []
  };
}

function loadState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return { readMarks: parsed?.readMarks ?? {}, lastMutate: parsed?.lastMutate ?? {} } as {
      readMarks: Record<string, number>;
      lastMutate: Record<string, number>;
    };
  } catch {
    return { readMarks: {}, lastMutate: {} };
  }
}

function saveState(st: { readMarks: Record<string, number>; lastMutate: Record<string, number> }) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(st, null, 2), "utf8");
}

const normalizePath = (p: string) => path.resolve(p);

function rxList(patterns: string[]): RegExp[] {
  return patterns.map((p) => new RegExp(p));
}

function parseGuardOp(cmd: string, cfg: Cfg): { op?: string; file?: string } {
  const esc = cfg.guardToolPattern;
  const capture = `(?:"([^\"]+)"|'([^']+)'|(\\S+))`;

  const readRx = new RegExp(`${esc}\\s+${cfg.readMarkOp}\\s+${capture}`);
  const mRead = cmd.match(readRx);
  if (mRead) return { op: cfg.readMarkOp, file: mRead[1] || mRead[2] || mRead[3] };

  for (const op of cfg.mutateOps) {
    const r = new RegExp(`${esc}\\s+${op}\\s+${capture}`);
    const m = cmd.match(r);
    if (m) return { op, file: m[1] || m[2] || m[3] };
  }
  return {};
}

export default function register(api: any) {
  const cfg = cfgFromPlugin(api.pluginConfig);
  const blocked = rxList(cfg.blockedExecRegexes);
  const allowed = rxList(cfg.allowExecRegexes);

  api.registerHook(
    "before_tool_call",
    (event: { toolName: string; params: Record<string, unknown> }) => {
      if (!cfg.enabled) return;
      if (event.toolName !== "exec") return;
      const cmd = typeof event.params.command === "string" ? event.params.command : "";
      if (!cmd) return;

      if (allowed.some((r) => r.test(cmd))) return;

      const op = parseGuardOp(cmd, cfg);
      const now = Math.floor(Date.now() / 1000);

      if (op.op === cfg.readMarkOp && op.file) {
        const st = loadState();
        st.readMarks[normalizePath(op.file)] = now;
        saveState(st);
        return;
      }

      if (op.op && cfg.mutateOps.includes(op.op) && op.file) {
        const st = loadState();
        const p = normalizePath(op.file);
        const t = st.readMarks[p];
        if (!t || now - t > cfg.readTtlSec) {
          return { block: true, blockReason: `opseq blocked: missing/stale read-mark for ${p}` };
        }
        const lm = st.lastMutate[p];
        if (lm && now - lm < cfg.cooldownSec) {
          return {
            block: true,
            blockReason: `opseq blocked: cooldown active for ${p} (${cfg.cooldownSec - (now - lm)}s left)`
          };
        }
        st.lastMutate[p] = now;
        saveState(st);
        return;
      }

      if (blocked.some((r) => r.test(cmd))) {
        return {
          block: true,
          blockReason: "Blocked by hookify-enforcer: exec mutation must use configured op-sequence."
        };
      }
    },
    { name: "hookify-before-tool-call", priority: 1000 }
  );
}
