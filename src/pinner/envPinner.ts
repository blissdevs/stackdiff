export type PinEntry = { key: string; value: string; pinnedAt: string };
export type PinMap = Map<string, PinEntry>;

export function pinKeys(
  envMap: Map<string, string>,
  keys: string[]
): PinMap {
  const pinMap: PinMap = new Map();
  for (const key of keys) {
    if (envMap.has(key)) {
      pinMap.set(key, {
        key,
        value: envMap.get(key)!,
        pinnedAt: new Date().toISOString(),
      });
    }
  }
  return pinMap;
}

export function checkPinViolations(
  envMap: Map<string, string>,
  pinMap: PinMap
): { key: string; expected: string; actual: string | undefined }[] {
  const violations: { key: string; expected: string; actual: string | undefined }[] = [];
  for (const [key, entry] of pinMap) {
    const actual = envMap.get(key);
    if (actual !== entry.value) {
      violations.push({ key, expected: entry.value, actual });
    }
  }
  return violations;
}

export function formatPinReport(
  pinMap: PinMap,
  violations: { key: string; expected: string; actual: string | undefined }[]
): string {
  const lines: string[] = [`Pinned keys: ${pinMap.size}`];
  if (violations.length === 0) {
    lines.push('All pinned keys match. No violations.');
  } else {
    lines.push(`Violations: ${violations.length}`);
    for (const v of violations) {
      const actual = v.actual === undefined ? '(missing)' : v.actual;
      lines.push(`  [VIOLATION] ${v.key}: expected "${v.expected}", got "${actual}"`);
    }
  }
  return lines.join('\n');
}

export function pinMapToJson(pinMap: PinMap): object {
  const obj: Record<string, PinEntry> = {};
  for (const [key, entry] of pinMap) {
    obj[key] = entry;
  }
  return obj;
}

/**
 * Restores a PinMap from a plain JSON object (e.g. parsed from disk).
 * Throws if any entry is missing required fields.
 */
export function pinMapFromJson(json: unknown): PinMap {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    throw new Error('Invalid pin map JSON: expected a plain object');
  }
  const pinMap: PinMap = new Map();
  for (const [key, entry] of Object.entries(json as Record<string, unknown>)) {
    if (
      typeof entry !== 'object' || entry === null ||
      typeof (entry as Record<string, unknown>).key !== 'string' ||
      typeof (entry as Record<string, unknown>).value !== 'string' ||
      typeof (entry as Record<string, unknown>).pinnedAt !== 'string'
    ) {
      throw new Error(`Invalid pin entry for key "${key}"`);
    }
    pinMap.set(key, entry as PinEntry);
  }
  return pinMap;
}
