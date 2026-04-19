export type FrozenEnvMap = Readonly<Record<string, string>>;

export interface FreezeResult {
  frozen: FrozenEnvMap;
  frozenKeys: string[];
}

export interface UnfreezeResult {
  unfrozen: Record<string, string>;
  skippedKeys: string[];
}

export function freezeEnvMap(
  env: Record<string, string>,
  keys?: string[]
): FreezeResult {
  const frozenKeys: string[] = [];
  const frozen: Record<string, string> = {};

  for (const [k, v] of Object.entries(env)) {
    if (!keys || keys.includes(k)) {
      frozen[k] = v;
      frozenKeys.push(k);
    } else {
      frozen[k] = v;
    }
  }

  return { frozen: Object.freeze(frozen), frozenKeys };
}

export function isFrozen(env: unknown): boolean {
  return Object.isFrozen(env);
}

export function unfreezeEnvMap(
  frozen: FrozenEnvMap,
  overrides: Record<string, string> = {},
  protectedKeys: string[] = []
): UnfreezeResult {
  const unfrozen: Record<string, string> = { ...frozen };
  const skippedKeys: string[] = [];

  for (const [k, v] of Object.entries(overrides)) {
    if (protectedKeys.includes(k)) {
      skippedKeys.push(k);
    } else {
      unfrozen[k] = v;
    }
  }

  return { unfrozen, skippedKeys };
}

export function formatFreezeReport(result: FreezeResult): string {
  const lines: string[] = [`Frozen keys (${result.frozenKeys.length}):`, ""];
  for (const k of result.frozenKeys) {
    lines.push(`  [frozen] ${k}=${result.frozen[k]}`);
  }
  return lines.join("\n");
}
