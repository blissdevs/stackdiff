export type RenameMap = Record<string, string>;

export interface RenameResult {
  renamed: Map<string, string>;
  skipped: string[];
  conflicts: string[];
}

export function buildRenameMap(pairs: string[]): RenameMap {
  const map: RenameMap = {};
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 1) continue;
    const from = pair.slice(0, idx).trim();
    const to = pair.slice(idx + 1).trim();
    if (from && to) map[from] = to;
  }
  return map;
}

export function replaceKeyPrefix(
  key: string,
  oldPrefix: string,
  newPrefix: string
): string {
  if (key.startsWith(oldPrefix)) {
    return newPrefix + key.slice(oldPrefix.length);
  }
  return key;
}

export function renameEnvKeys(
  env: Map<string, string>,
  renameMap: RenameMap
): RenameResult {
  const renamed = new Map<string, string>();
  const skipped: string[] = [];
  const conflicts: string[] = [];
  const targetKeys = new Set(Object.values(renameMap));

  for (const [key, value] of env.entries()) {
    const newKey = renameMap[key];
    if (!newKey) {
      renamed.set(key, value);
      continue;
    }
    if (env.has(newKey) && !renameMap[newKey]) {
      conflicts.push(key);
      renamed.set(key, value);
      continue;
    }
    renamed.set(newKey, value);
    skipped.push(key);
  }

  // Remove original keys that were renamed
  for (const key of skipped) {
    renamed.delete(key);
  }

  return { renamed, skipped, conflicts };
}

export function formatRenameReport(result: RenameResult): string {
  const lines: string[] = ['Rename Report', '============='];
  lines.push(`Renamed: ${result.skipped.length} key(s)`);
  for (const k of result.skipped) lines.push(`  - ${k}`);
  if (result.conflicts.length > 0) {
    lines.push(`Conflicts (skipped): ${result.conflicts.length}`);
    for (const k of result.conflicts) lines.push(`  ! ${k}`);
  }
  return lines.join('\n');
}
