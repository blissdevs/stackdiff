import { EnvMap } from '../parser/envParser';

export interface CloneOptions {
  prefix?: string;
  suffix?: string;
  overwrite?: boolean;
  keys?: string[];
}

export interface CloneResult {
  cloned: EnvMap;
  skipped: string[];
  added: string[];
}

export function cloneEnvMap(
  source: EnvMap,
  target: EnvMap,
  options: CloneOptions = {}
): CloneResult {
  const { prefix = '', suffix = '', overwrite = false, keys } = options;
  const cloned: EnvMap = new Map(target);
  const skipped: string[] = [];
  const added: string[] = [];

  const entries = keys
    ? [...source.entries()].filter(([k]) => keys.includes(k))
    : [...source.entries()];

  for (const [key, value] of entries) {
    const newKey = `${prefix}${key}${suffix}`;
    if (cloned.has(newKey) && !overwrite) {
      skipped.push(newKey);
      continue;
    }
    cloned.set(newKey, value);
    added.push(newKey);
  }

  return { cloned, skipped, added };
}

export function formatCloneReport(result: CloneResult): string {
  const lines: string[] = [];
  lines.push(`Cloned: ${result.added.length} key(s)`);
  if (result.added.length > 0) {
    result.added.forEach(k => lines.push(`  + ${k}`));
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped (already exist): ${result.skipped.length} key(s)`);
    result.skipped.forEach(k => lines.push(`  ~ ${k}`));
  }
  return lines.join('\n');
}
