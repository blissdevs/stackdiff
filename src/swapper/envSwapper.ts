import { EnvMap } from "../parser/envParser";

export interface SwapPair {
  from: string;
  to: string;
}

export interface SwapResult {
  original: EnvMap;
  swapped: EnvMap;
  applied: SwapPair[];
  skipped: SwapPair[];
}

/**
 * Swap key names in an EnvMap according to a list of swap pairs.
 * If the `from` key does not exist, the pair is recorded as skipped.
 * If both `from` and `to` exist, `from` is renamed to `to` and the
 * original `to` value is overwritten.
 */
export function swapEnvKeys(env: EnvMap, pairs: SwapPair[]): SwapResult {
  const swapped: EnvMap = new Map(env);
  const applied: SwapPair[] = [];
  const skipped: SwapPair[] = [];

  for (const pair of pairs) {
    if (!swapped.has(pair.from)) {
      skipped.push(pair);
      continue;
    }
    const value = swapped.get(pair.from)!;
    swapped.delete(pair.from);
    swapped.set(pair.to, value);
    applied.push(pair);
  }

  return { original: env, swapped, applied, skipped };
}

export function formatSwapReport(result: SwapResult): string {
  const lines: string[] = ["=== Swap Report ==="];

  if (result.applied.length > 0) {
    lines.push(`\nApplied (${result.applied.length}):`);
    for (const p of result.applied) {
      lines.push(`  ${p.from} -> ${p.to}`);
    }
  }

  if (result.skipped.length > 0) {
    lines.push(`\nSkipped (${result.skipped.length}):`);
    for (const p of result.skipped) {
      lines.push(`  ${p.from} -> ${p.to}  (key not found)`);
    }
  }

  lines.push(`\nTotal keys: ${result.swapped.size}`);
  return lines.join("\n");
}

export function swapResultToJson(result: SwapResult): object {
  return {
    applied: result.applied,
    skipped: result.skipped,
    swapped: Object.fromEntries(result.swapped),
  };
}
