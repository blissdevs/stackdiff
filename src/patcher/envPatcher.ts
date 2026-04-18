import { EnvMap } from '../parser/envParser';

export type PatchOperation =
  | { op: 'set'; key: string; value: string }
  | { op: 'delete'; key: string }
  | { op: 'rename'; from: string; to: string };

export interface PatchResult {
  patched: EnvMap;
  applied: PatchOperation[];
  skipped: PatchOperation[];
}

export function applyPatch(base: EnvMap, ops: PatchOperation[]): PatchResult {
  const patched = new Map(base);
  const applied: PatchOperation[] = [];
  const skipped: PatchOperation[] = [];

  for (const op of ops) {
    if (op.op === 'set') {
      patched.set(op.key, op.value);
      applied.push(op);
    } else if (op.op === 'delete') {
      if (patched.has(op.key)) {
        patched.delete(op.key);
        applied.push(op);
      } else {
        skipped.push(op);
      }
    } else if (op.op === 'rename') {
      if (patched.has(op.from)) {
        const val = patched.get(op.from)!;
        patched.delete(op.from);
        patched.set(op.to, val);
        applied.push(op);
      } else {
        skipped.push(op);
      }
    }
  }

  return { patched, applied, skipped };
}

export function buildPatchFromDiff(
  before: EnvMap,
  after: EnvMap
): PatchOperation[] {
  const ops: PatchOperation[] = [];

  for (const [key, value] of after) {
    if (!before.has(key) || before.get(key) !== value) {
      ops.push({ op: 'set', key, value });
    }
  }

  for (const key of before.keys()) {
    if (!after.has(key)) {
      ops.push({ op: 'delete', key });
    }
  }

  return ops;
}

export function formatPatchReport(result: PatchResult): string {
  const lines: string[] = [];
  lines.push(`Applied: ${result.applied.length}, Skipped: ${result.skipped.length}`);
  for (const op of result.applied) {
    if (op.op === 'set') lines.push(`  + SET ${op.key}=${op.value}`);
    else if (op.op === 'delete') lines.push(`  - DELETE ${op.key}`);
    else if (op.op === 'rename') lines.push(`  ~ RENAME ${op.from} -> ${op.to}`);
  }
  for (const op of result.skipped) {
    const key = op.op === 'rename' ? op.from : op.key;
    lines.push(`  ? SKIPPED ${op.op.toUpperCase()} ${key} (key not found)`);
  }
  return lines.join('\n');
}
