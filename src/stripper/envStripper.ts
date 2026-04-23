/**
 * envStripper.ts
 * Strips keys from an env map based on patterns, prefixes, or explicit lists.
 */

export interface StripOptions {
  keys?: string[];
  prefixes?: string[];
  patterns?: RegExp[];
}

export interface StripResult {
  stripped: Map<string, string>;
  removed: Map<string, string>;
}

export function shouldStrip(key: string, options: StripOptions): boolean {
  if (options.keys?.includes(key)) return true;
  if (options.prefixes?.some((p) => key.startsWith(p))) return true;
  if (options.patterns?.some((r) => r.test(key))) return true;
  return false;
}

export function stripEnvMap(
  env: Map<string, string>,
  options: StripOptions
): StripResult {
  const stripped = new Map<string, string>();
  const removed = new Map<string, string>();

  for (const [key, value] of env) {
    if (shouldStrip(key, options)) {
      removed.set(key, value);
    } else {
      stripped.set(key, value);
    }
  }

  return { stripped, removed };
}

export function formatStripReport(result: StripResult): string {
  const lines: string[] = [];
  lines.push(`Stripped ${result.removed.size} key(s), kept ${result.stripped.size} key(s).`);

  if (result.removed.size > 0) {
    lines.push("\nRemoved keys:");
    for (const key of result.removed.keys()) {
      lines.push(`  - ${key}`);
    }
  }

  return lines.join("\n");
}
