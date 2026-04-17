/**
 * envFilter.ts
 * Filter and search utilities for env variable maps.
 */

export type EnvMap = Record<string, string>;

export interface FilterOptions {
  keys?: string[];       // include only these keys (exact match)
  pattern?: string;     // include keys matching this regex pattern
  excludeKeys?: string[]; // exclude these keys
  excludePattern?: string; // exclude keys matching this regex
}

/**
 * Filter an EnvMap by key inclusion/exclusion rules.
 */
export function filterEnvMap(env: EnvMap, options: FilterOptions): EnvMap {
  const {
    keys,
    pattern,
    excludeKeys = [],
    excludePattern,
  } = options;

  const includeRegex = pattern ? new RegExp(pattern) : null;
  const excludeRegex = excludePattern ? new RegExp(excludePattern) : null;

  const result: EnvMap = {};

  for (const [key, value] of Object.entries(env)) {
    // Exclusion checks
    if (excludeKeys.includes(key)) continue;
    if (excludeRegex && excludeRegex.test(key)) continue;

    // Inclusion checks
    if (keys && keys.length > 0 && !keys.includes(key)) continue;
    if (includeRegex && !includeRegex.test(key)) continue;

    result[key] = value;
  }

  return result;
}

/**
 * Search for keys containing a substring (case-insensitive).
 */
export function searchEnvMap(env: EnvMap, query: string): EnvMap {
  const lower = query.toLowerCase();
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.toLowerCase().includes(lower)) {
      result[key] = value;
    }
  }
  return result;
}
