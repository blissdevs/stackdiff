import { EnvMap } from "../parser/envParser";

export interface CombineOptions {
  prefix?: string;
  overwrite?: boolean;
  skipEmpty?: boolean;
}

export interface CombineResult {
  combined: EnvMap;
  sources: number;
  totalKeys: number;
  skippedKeys: string[];
  overwrittenKeys: string[];
}

/**
 * Combines multiple EnvMaps into a single map.
 * Later maps take precedence unless overwrite is false.
 */
export function combineEnvMaps(
  maps: EnvMap[],
  options: CombineOptions = {}
): CombineResult {
  const { prefix = "", overwrite = true, skipEmpty = false } = options;
  const combined: EnvMap = new Map();
  const skippedKeys: string[] = [];
  const overwrittenKeys: string[] = [];

  for (const map of maps) {
    for (const [key, value] of map.entries()) {
      if (skipEmpty && value.trim() === "") {
        skippedKeys.push(key);
        continue;
      }

      const finalKey = prefix ? `${prefix}${key}` : key;

      if (combined.has(finalKey) && !overwrite) {
        skippedKeys.push(finalKey);
        continue;
      }

      if (combined.has(finalKey) && overwrite) {
        overwrittenKeys.push(finalKey);
      }

      combined.set(finalKey, value);
    }
  }

  return {
    combined,
    sources: maps.length,
    totalKeys: combined.size,
    skippedKeys,
    overwrittenKeys,
  };
}

export function formatCombineReport(result: CombineResult): string {
  const lines: string[] = [
    `Combined ${result.sources} source(s) into ${result.totalKeys} key(s).`,
  ];

  if (result.overwrittenKeys.length > 0) {
    lines.push(
      `Overwritten keys (${result.overwrittenKeys.length}): ${result.overwrittenKeys.join(", ")}`
    );
  }

  if (result.skippedKeys.length > 0) {
    lines.push(
      `Skipped keys (${result.skippedKeys.length}): ${result.skippedKeys.join(", ")}`
    );
  }

  return lines.join("\n");
}
