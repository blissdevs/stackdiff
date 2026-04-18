/**
 * envInterpolator.ts
 * Resolves variable references within env maps (e.g. FOO=${BAR}_suffix)
 */

export type EnvMap = Map<string, string>;

const REF_PATTERN = /\$\{([^}]+)\}/g;

/**
 * Resolve a single value against a given env map.
 * Unresolved references are left as-is.
 */
export function interpolateValue(value: string, envMap: EnvMap): string {
  return value.replace(REF_PATTERN, (match, key) => {
    return envMap.has(key) ? (envMap.get(key) as string) : match;
  });
}

/**
 * Interpolate all values in an env map.
 * Performs a single pass; circular refs remain unresolved.
 */
export function interpolateEnvMap(envMap: EnvMap): EnvMap {
  const result: EnvMap = new Map();
  for (const [key, value] of envMap.entries()) {
    result.set(key, interpolateValue(value, envMap));
  }
  return result;
}

/**
 * Detect keys whose values contain unresolved references after interpolation.
 */
export function findUnresolvedRefs(envMap: EnvMap): string[] {
  const interpolated = interpolateEnvMap(envMap);
  const unresolved: string[] = [];
  for (const [key, value] of interpolated.entries()) {
    if (REF_PATTERN.test(value)) {
      unresolved.push(key);
    }
    REF_PATTERN.lastIndex = 0;
  }
  return unresolved;
}
