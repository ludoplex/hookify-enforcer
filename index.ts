import fs from "node:fs";
import path from "node:path";

type BeforeToolCallEvent = { toolName: string; params: Record<string, unknown> };

type BeforeToolCallResult = {
  params?: Record<string, unknown>;
  block?: boolean;
  blockReason?: string;
};

const ROOT = "/home/user/.openclaw/workspace";
const STATE_DIR = path.join(ROOT, ".enforcer");
const STATE_FILE = path.join(STATE_DIR, "opseq-state.json");
const READ_TTL_SEC = Number(process.env.OPSEQ_READ_TTL_SEC || 1800);
const COOLDOWN_SEC = Number(process.env.OPSEQ_COOLDOWN_SEC || 20);

function normalizePath(p: string): string {
  return path.resolve(p);
}

function loadState(): { readMarks: Record<string, number>; lastMutate: Record<string, number> } {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      readMarks: parsed?.readMarks ?? {},
      lastMutate: parsed?.lastMutate ?? {},
    };
  } catch {
    return { readMarks: {}, lastMutate: {} };
  }
}

function saveState(st: { readMarks: Record<string, number>; lastMutate: Record<string, number> }) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(st, null, 2), "utf8");
}

function getExecCommand(params: Record<string, unknown>): string {
  const c = params.command;
  return typeof c === "string" ? c : "";
}

function parseOpseq(cmd: string): { op?: "read-mark" | "append" | "insert-after"; file?: string } {
  const readMark = cmd.match(/opseq_guard\.py\s+read-mark\s+(?:"([^"]+)"|'([^']+)'|(\S+))/);
  if (readMark) return { op: "read-mark", file: readMark[1] || readMark[2] || readMark[3] };

  const append = cmd.match(/opseq_guard\.py\s+append\s+(?:"([^"]+)"|'([^']+)'|(\S+))/);
  if (append) return { op: "append", file: append[1] || append[2] || append[3] };

  const ins = cmd.match(/opseq_guard\.py\s+insert-after\s+(?:"([^"]+)"|'([^']+)'|(\S+))/);
  if (ins) return { op: "insert-after", file: ins[1] || ins[2] || ins[3] };

  return {};
}

function looksLikeMutation(cmd: string): boolean {
  return /\brm\b|\bmv\b|\btruncate\b|\bsed\b\s+-i\b|\bperl\b\s+-i\b|\becho\b.*>|\bcat\b.*>/.test(cmd);
}

function enforceOpSeq(op: "append" | "insert-after", file: string): BeforeToolCallResult | undefined {
  const p = normalizePath(file);
  const now = Math.floor(Date.now() / 1000);
  const st = loadState();
  const t = st.readMarks[p];
  if (!t || now - t > READ_TTL_SEC) {
    return { block: true, blockReason: `opseq blocked: missing/stale read-mark for ${p}` };
  }
  const lm = st.lastMutate[p];
  if (lm && now - lm < COOLDOWN_SEC) {
    return { block: true, blockReason: `opseq blocked: cooldown active for ${p} (${COOLDOWN_SEC - (now - lm)}s left)` };
  }
  st.lastMutate[p] = now;
  saveState(st);
  return undefined;
}

export default function register(api: any) {
  api.registerHook(
    "before_tool_call",
    (event: BeforeToolCallEvent): BeforeToolCallResult | void => {
      if (event.toolName !== "exec") return;
      const cmd = getExecCommand(event.params);

      const op = parseOpseq(cmd);
      if (op.op === "read-mark" && op.file) {
        const st = loadState();
        st.readMarks[normalizePath(op.file)] = Math.floor(Date.now() / 1000);
        saveState(st);
        return;
      }
      if ((op.op === "append" || op.op === "insert-after") && op.file) {
        return enforceOpSeq(op.op, op.file);
      }

      if (looksLikeMutation(cmd)) {
        return {
          block: true,
          blockReason:
            "Blocked by hookify-enforcer: mutation via exec must use opseq_guard.py read-mark + append/insert-after sequence.",
        };
      }
    },
    { priority: 1000 }
  );
}
