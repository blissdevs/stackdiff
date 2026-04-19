export interface DuplicateEntry {
  key: string;
  values: string[];
  sources: number[];
}

export interface DedupeResult {
  deduped: Map<string, string>;
  duplicates: DuplicateEntry[];
}

export type DedupeStrategy = 'first' | 'last' | 'error';

export function dedupeEnvMaps(
  maps: Map<string, string>[],
  strategy: DedupeStrategy = 'last'
): DedupeResult {
  const seen = new Map<string, { values: string[]; sources: number[] }>();

  for (let i = 0; i < maps.length; i++) {
    for (const [key, value] of maps[i]) {
      if (!seen.has(key)) {
        seen.set(key, { values: [value], sources: [i] });
      } else {
        const entry = seen.get(key)!;
        entry.values.push(value);
        entry.sources.push(i);
      }
    }
  }

  const deduped = new Map<string, string>();
  const duplicates: DuplicateEntry[] = [];

  for (const [key, { values, sources }] of seen) {
    if (values.length > 1) {
      duplicates.push({ key, values, sources });
      if (strategy === 'error') continue;
      deduped.set(key, strategy === 'first' ? values[0] : values[values.length - 1]);
    } else {
      deduped.set(key, values[0]);
    }
  }

  return { deduped, duplicates };
}

export function formatDedupeReport(duplicates: DuplicateEntry[]): string {
  if (duplicates.length === 0) return 'No duplicate keys found.';
  const lines = ['Duplicate keys detected:'];
  for (const { key, values, sources } of duplicates) {
    lines.push(`  ${key}: [${values.map((v, i) => `src${sources[i]}=${v}`).join(', ')}]`);
  }
  return lines.join('\n');
}
