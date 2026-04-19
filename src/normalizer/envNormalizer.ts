export type NormalizeOptions = {
  trimValues?: boolean;
  uppercaseKeys?: boolean;
  removeEmptyValues?: boolean;
  collapseWhitespace?: boolean;
};

const DEFAULT_OPTIONS: NormalizeOptions = {
  trimValues: true,
  uppercaseKeys: false,
  removeEmptyValues: false,
  collapseWhitespace: false,
};

export function normalizeKey(key: string, options: NormalizeOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = key.trim();
  if (opts.uppercaseKeys) result = result.toUpperCase();
  return result;
}

export function normalizeValue(value: string, options: NormalizeOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = value;
  if (opts.trimValues) result = result.trim();
  if (opts.collapseWhitespace) result = result.replace(/\s+/g, ' ');
  return result;
}

export function normalizeEnvMap(
  env: Map<string, string>,
  options: NormalizeOptions = {}
): Map<string, string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result = new Map<string, string>();

  for (const [key, value] of env.entries()) {
    const normalizedKey = normalizeKey(key, opts);
    const normalizedValue = normalizeValue(value, opts);

    if (opts.removeEmptyValues && normalizedValue === '') continue;

    result.set(normalizedKey, normalizedValue);
  }

  return result;
}

export function formatNormalizeReport(
  original: Map<string, string>,
  normalized: Map<string, string>
): string {
  const lines: string[] = ['Normalization Report', '='.repeat(30)];
  let changes = 0;

  for (const [key, value] of original.entries()) {
    const nKey = normalized.has(key) ? key : [...normalized.keys()].find(k => k === key.trim().toUpperCase()) ?? key;
    const nVal = normalized.get(nKey) ?? '';
    if (key !== nKey || value !== nVal) {
      lines.push(`  ${key}=${value} → ${nKey}=${nVal}`);
      changes++;
    }
  }

  const removed = original.size - normalized.size;
  lines.push('');
  lines.push(`Changes: ${changes}, Removed: ${removed}, Total: ${normalized.size}`);
  return lines.join('\n');
}
