import { EnvMap } from '../parser';

export type MergeStrategy = 'first-wins' | 'last-wins' | 'error-on-conflict';

export interface MergeOptions {
  strategy?: MergeStrategy;
  prefix?: string[];
}

export interface MergeConflict {
  key: string;
  values: string[];
}

export interface MergeResult {
  merged: EnvMap;
  conflicts: MergeConflict[];
}

export function mergeEnvMaps(
  maps: EnvMap[],
  options: MergeOptions = {}
): MergeResult {
  const strategy = options.strategy ?? 'last-wins';
  const merged: EnvMap = new Map();
  const seen = new Map<string, string[]>();
  const conflicts: MergeConflict[] = [];

  for (const map of maps) {
    for (const [key, value] of map.entries()) {
      if (!seen.has(key)) {
        seen.set(key, [value]);
        merged.set(key, value);
      } else {
        const prev = seen.get(key)!;
        if (prev[prev.length - 1] !== value) {
          prev.push(value);
          if (strategy === 'error-on-conflict') {
            throw new Error(`Merge conflict on key: ${key}`);
          } else if (strategy === 'last-wins') {
            merged.set(key, value);
          }
          // first-wins: keep original, do nothing
        }
      }
    }
  }

  for (const [key, values] of seen.entries()) {
    if (values.length > 1) {
      conflicts.push({ key, values });
    }
  }

  return { merged, conflicts };
}

export function formatMergeConflicts(conflicts: MergeConflict[]): string {
  if (conflicts.length === 0) return 'No conflicts.';
  const lines = conflicts.map(
    (c) => `  ${c.key}: [${c.values.map((v) => JSON.stringify(v)).join(', ')}]`
  );
  return `Conflicts (${conflicts.length}):\n${lines.join('\n')}`;
}
