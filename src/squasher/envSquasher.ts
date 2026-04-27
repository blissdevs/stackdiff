import { EnvMap } from "../parser/envParser";

export interface SquashOptions {
  preferLast?: boolean;
  ignoreEmpty?: boolean;
  keepKeys?: string[];
}

export interface SquashResult {
  squashed: EnvMap;
  overrides: Record<string, { from: string; to: string; source: number }[]>;
  skipped: string[];
}

/**
 * Squash multiple EnvMaps into one, tracking overrides and skipped entries.
 */
export function squashEnvMaps(
  maps: EnvMap[],
  options: SquashOptions = {}
): SquashResult {
  const { preferLast = true, ignoreEmpty = false, keepKeys = [] } = options;
  const squashed: EnvMap = new Map();
  const overrides: Record<string, { from: string; to: string; source: number }[]> = {};
  const skipped: string[] = [];

  maps.forEach((map, sourceIndex) => {
    for (const [key, value] of map.entries()) {
      if (ignoreEmpty && value.trim() === "") {
        if (!squashed.has(key)) skipped.push(key);
        continue;
      }

      if (squashed.has(key)) {
        const existing = squashed.get(key)!;
        if (preferLast || keepKeys.includes(key)) {
          if (!overrides[key]) overrides[key] = [];
          overrides[key].push({ from: existing, to: value, source: sourceIndex });
          squashed.set(key, value);
        }
      } else {
        squashed.set(key, value);
      }
    }
  });

  return { squashed, overrides, skipped };
}

export function formatSquashReport(result: SquashResult): string {
  const lines: string[] = [];
  lines.push(`Squashed keys: ${result.squashed.size}`);

  const overrideKeys = Object.keys(result.overrides);
  if (overrideKeys.length > 0) {
    lines.push(`\nOverrides (${overrideKeys.length}):`);
    for (const key of overrideKeys) {
      for (const o of result.overrides[key]) {
        lines.push(`  ${key}: "${o.from}" -> "${o.to}" (source #${o.source})`);
      }
    }
  }

  if (result.skipped.length > 0) {
    lines.push(`\nSkipped empty keys (${result.skipped.length}):`);
    for (const key of result.skipped) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join("\n");
}
