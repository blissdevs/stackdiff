export type RenameMap = Record<string, string>;

export interface RenameResult {
  renamed: Record<string, string>;
  skipped: string[];
  applied: RenameMap;
}

/**
 * Rename keys in an env map according to a rename map.
 * Keys not found in the rename map are left unchanged.
 */
export function renameEnvKeys(
  envMap: Map<string, string>,
  renameMap: RenameMap
): RenameResult {
  const renamed: Record<string, string> = {};
  const skipped: string[] = [];
  const applied: RenameMap = {};

  for (const [key, value] of envMap.entries()) {
    if (renameMap[key] !== undefined) {
      const newKey = renameMap[key];
      renamed[newKey] = value;
      applied[key] = newKey;
    } else {
      renamed[key] = value;
      skipped.push(key);
    }
  }

  return { renamed, skipped, applied };
}

/**
 * Build a rename map from two parallel arrays of old/new key names.
 */
export function buildRenameMap(from: string[], to: string[]): RenameMap {
  if (from.length !== to.length) {
    throw new Error(
      `buildRenameMap: 'from' and 'to' arrays must be the same length`
    );
  }
  const map: RenameMap = {};
  for (let i = 0; i < from.length; i++) {
    map[from[i]] = to[i];
  }
  return map;
}

/**
 * Apply a prefix replacement to all matching keys.
 */
export function replaceKeyPrefix(
  envMap: Map<string, string>,
  oldPrefix: string,
  newPrefix: string
): RenameResult {
  const renameMap: RenameMap = {};
  for (const key of envMap.keys()) {
    if (key.startsWith(oldPrefix)) {
      renameMap[key] = newPrefix + key.slice(oldPrefix.length);
    }
  }
  return renameEnvKeys(envMap, renameMap);
}
