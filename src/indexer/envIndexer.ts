export interface EnvIndex {
  byKey: Map<string, string[]>;   // key -> list of source names
  byValue: Map<string, string[]>; // value -> list of keys
  bySource: Map<string, string[]>; // source name -> list of keys
}

export interface IndexEntry {
  key: string;
  value: string;
  sources: string[];
}

/**
 * Build a reverse index over multiple named env maps.
 */
export function buildEnvIndex(
  maps: Record<string, Map<string, string>>
): EnvIndex {
  const byKey = new Map<string, string[]>();
  const byValue = new Map<string, string[]>();
  const bySource = new Map<string, string[]>();

  for (const [source, map] of Object.entries(maps)) {
    const sourceKeys: string[] = [];
    for (const [key, value] of map.entries()) {
      // byKey
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key)!.push(source);

      // byValue
      if (!byValue.has(value)) byValue.set(value, []);
      byValue.get(value)!.push(key);

      sourceKeys.push(key);
    }
    bySource.set(source, sourceKeys);
  }

  return { byKey, byValue, bySource };
}

/**
 * Look up all sources that define a given key.
 */
export function lookupKey(index: EnvIndex, key: string): string[] {
  return index.byKey.get(key) ?? [];
}

/**
 * Find all keys that share the same value across any source.
 */
export function lookupValue(index: EnvIndex, value: string): string[] {
  return index.byValue.get(value) ?? [];
}

/**
 * Format a human-readable index report.
 */
export function formatIndexReport(index: EnvIndex): string {
  const lines: string[] = ['=== Env Index Report ===', ''];

  lines.push('Keys by source count:');
  const sorted = [...index.byKey.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [key, sources] of sorted) {
    lines.push(`  ${key}: [${sources.join(', ')}]`);
  }

  lines.push('');
  lines.push('Sources:');
  for (const [source, keys] of index.bySource.entries()) {
    lines.push(`  ${source}: ${keys.length} key(s)`);
  }

  return lines.join('\n');
}
