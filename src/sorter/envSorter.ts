import { EnvMap } from '../parser/envParser';

export interface SortOptions {
  order?: 'asc' | 'desc';
  groupByPrefix?: boolean;
  prefixDelimiter?: string;
}

export function sortEnvMap(map: EnvMap, order: 'asc' | 'desc' = 'asc'): EnvMap {
  const entries = Array.from(map.entries());
  entries.sort(([a], [b]) => {
    const cmp = a.localeCompare(b);
    return order === 'asc' ? cmp : -cmp;
  });
  return new Map(entries);
}

export function groupEnvByPrefix(
  map: EnvMap,
  delimiter = '_'
): Record<string, EnvMap> {
  const groups: Record<string, EnvMap> = {};
  for (const [key, value] of map.entries()) {
    const idx = key.indexOf(delimiter);
    const prefix = idx !== -1 ? key.substring(0, idx) : '__ungrouped__';
    if (!groups[prefix]) groups[prefix] = new Map();
    groups[prefix].set(key, value);
  }
  return groups;
}

export function applySortOptions(map: EnvMap, options: SortOptions): EnvMap {
  const { order = 'asc', groupByPrefix = false, prefixDelimiter = '_' } = options;

  if (!groupByPrefix) {
    return sortEnvMap(map, order);
  }

  const groups = groupEnvByPrefix(map, prefixDelimiter);
  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    const cmp = a.localeCompare(b);
    return order === 'asc' ? cmp : -cmp;
  });

  const result: EnvMap = new Map();
  for (const groupKey of sortedGroupKeys) {
    const sorted = sortEnvMap(groups[groupKey], order);
    for (const [k, v] of sorted.entries()) {
      result.set(k, v);
    }
  }
  return result;
}
