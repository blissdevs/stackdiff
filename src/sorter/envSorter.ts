/**
 * Sorts and groups environment variable maps for consistent output.
 */

export type SortOrder = 'asc' | 'desc' | 'none';

export interface SortOptions {
  order?: SortOrder;
  groupByPrefix?: boolean;
  prefixDelimiter?: string;
}

/**
 * Sorts an env map by key according to the given order.
 */
export function sortEnvMap(
  env: Record<string, string>,
  order: SortOrder = 'asc'
): Record<string, string> {
  if (order === 'none') return env;

  const entries = Object.entries(env);
  entries.sort(([a], [b]) =>
    order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );

  return Object.fromEntries(entries);
}

/**
 * Groups env map keys by their prefix (e.g. "DB_HOST" -> group "DB").
 */
export function groupEnvByPrefix(
  env: Record<string, string>,
  delimiter: string = '_'
): Record<string, Record<string, string>> {
  const groups: Record<string, Record<string, string>> = {};

  for (const [key, value] of Object.entries(env)) {
    const delimIndex = key.indexOf(delimiter);
    const prefix = delimIndex > -1 ? key.substring(0, delimIndex) : '__other__';

    if (!groups[prefix]) {
      groups[prefix] = {};
    }
    groups[prefix][key] = value;
  }

  return groups;
}

/**
 * Applies sorting and optional prefix grouping to an env map.
 */
export function applySortOptions(
  env: Record<string, string>,
  options: SortOptions = {}
): Record<string, string> | Record<string, Record<string, string>> {
  const { order = 'asc', groupByPrefix = false, prefixDelimiter = '_' } = options;

  const sorted = sortEnvMap(env, order);

  if (groupByPrefix) {
    return groupEnvByPrefix(sorted, prefixDelimiter);
  }

  return sorted;
}
