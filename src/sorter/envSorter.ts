import { EnvMap } from '../parser/envParser';

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  order?: SortOrder;
  groupByPrefix?: boolean;
  prefixDelimiter?: string;
}

export function sortEnvMap(map: EnvMap, order: SortOrder = 'asc'): EnvMap {
  const entries = Array.from(map.entries());
  entries.sort(([a], [b]) => {
    const cmp = a.localeCompare(b);
    return order === 'asc' ? cmp : -cmp;
  });
  return new Map(entries);
}

export function groupEnvByPrefix(
  map: EnvMap,
  delimiter: string = '_'
): Map<string, EnvMap> {
  const groups = new Map<string, EnvMap>();

  for (const [key, value] of map.entries()) {
    const delimIdx = key.indexOf(delimiter);
    const prefix = delimIdx > -1 ? key.slice(0, delimIdx) : '__ungrouped__';

    if (!groups.has(prefix)) {
      groups.set(prefix, new Map());
    }
    groups.get(prefix)!.set(key, value);
  }

  return groups;
}

export function applySortOptions(map: EnvMap, options: SortOptions = {}): EnvMap {
  const { order = 'asc', groupByPrefix = false, prefixDelimiter = '_' } = options;

  if (!groupByPrefix) {
    return sortEnvMap(map, order);
  }

  const groups = groupEnvByPrefix(map, prefixDelimiter);
  const sortedGroupKeys = Array.from(groups.keys()).sort((a, b) => {
    const cmp = a.localeCompare(b);
    return order === 'asc' ? cmp : -cmp;
  });

  const result: EnvMap = new Map();
  for (const groupKey of sortedGroupKeys) {
    const groupMap = sortEnvMap(groups.get(groupKey)!, order);
    for (const [k, v] of groupMap.entries()) {
      result.set(k, v);
    }
  }

  return result;
}
