export type EnvMap = Record<string, string>;

export interface DiffResult {
  onlyInA: string[];
  onlyInB: string[];
  changed: Array<{ key: string; valueA: string; valueB: string }>;
  unchanged: string[];
}

/**
 * Compares two parsed environment maps and returns a structured diff.
 */
export function diffEnvMaps(a: EnvMap, b: EnvMap): DiffResult {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));
  const allKeys = new Set([...keysA, ...keysB]);

  const result: DiffResult = {
    onlyInA: [],
    onlyInB: [],
    changed: [],
    unchanged: [],
  };

  for (const key of allKeys) {
    const inA = keysA.has(key);
    const inB = keysB.has(key);

    if (inA && !inB) {
      result.onlyInA.push(key);
    } else if (!inA && inB) {
      result.onlyInB.push(key);
    } else if (a[key] !== b[key]) {
      result.changed.push({ key, valueA: a[key], valueB: b[key] });
    } else {
      result.unchanged.push(key);
    }
  }

  return result;
}

/**
 * Returns true if there are any differences between the two maps.
 */
export function hasDiff(result: DiffResult): boolean {
  return (
    result.onlyInA.length > 0 ||
    result.onlyInB.length > 0 ||
    result.changed.length > 0
  );
}
