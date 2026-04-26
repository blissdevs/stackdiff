/**
 * envResolver.ts
 *
 * Resolves environment variable values by looking them up across multiple
 * env maps in priority order — similar to how shells resolve variables from
 * layered sources (e.g., system → profile → local → override).
 */

export type EnvMap = Map<string, string>;

export interface ResolveResult {
  key: string;
  resolvedValue: string | undefined;
  sourceIndex: number | null; // which map in the stack provided the value
  sourceName: string | null;
  overriddenBy: string | null; // name of higher-priority source that shadowed this
}

export interface ResolveReport {
  results: ResolveResult[];
  resolved: number;
  unresolved: number;
  overridden: number;
}

/**
 * Resolves a single key across an ordered list of env maps.
 * Maps earlier in the array have higher priority (index 0 wins).
 */
export function resolveKey(
  key: string,
  maps: EnvMap[],
  names: string[]
): ResolveResult {
  let resolvedValue: string | undefined;
  let sourceIndex: number | null = null;
  let sourceName: string | null = null;
  let overriddenBy: string | null = null;

  for (let i = 0; i < maps.length; i++) {
    if (maps[i].has(key)) {
      if (sourceIndex === null) {
        resolvedValue = maps[i].get(key);
        sourceIndex = i;
        sourceName = names[i] ?? `source[${i}]`;
      } else {
        // A lower-priority source also has the key — it was overridden
        if (overriddenBy === null) {
          overriddenBy = names[sourceIndex] ?? `source[${sourceIndex}]`;
        }
        break;
      }
    }
  }

  return { key, resolvedValue, sourceIndex, sourceName, overriddenBy };
}

/**
 * Resolves all keys found across all maps, returning the winning value
 * for each key along with metadata about where it came from.
 */
export function resolveEnvMaps(
  maps: EnvMap[],
  names: string[]
): ResolveReport {
  const allKeys = new Set<string>();
  for (const map of maps) {
    for (const key of map.keys()) {
      allKeys.add(key);
    }
  }

  const results: ResolveResult[] = [];
  let resolved = 0;
  let unresolved = 0;
  let overridden = 0;

  for (const key of Array.from(allKeys).sort()) {
    const result = resolveKey(key, maps, names);
    results.push(result);

    if (result.resolvedValue !== undefined) {
      resolved++;
    } else {
      unresolved++;
    }

    if (result.overriddenBy !== null) {
      overridden++;
    }
  }

  return { results, resolved, unresolved, overridden };
}

/**
 * Formats a human-readable resolution report.
 */
export function formatResolveReport(report: ResolveReport): string {
  const lines: string[] = [
    `Resolved: ${report.resolved}  Unresolved: ${report.unresolved}  Overridden: ${report.overridden}`,
    "",
  ];

  for (const r of report.results) {
    const value = r.resolvedValue !== undefined ? `"${r.resolvedValue}"` : "(unresolved)";
    const source = r.sourceName ?? "none";
    const override = r.overriddenBy ? ` [overrides ${r.overriddenBy}]` : "";
    lines.push(`  ${r.key} = ${value}  (from: ${source}${override})`);
  }

  return lines.join("\n");
}

/**
 * Collapses the resolution results into a single flat EnvMap
 * containing only the winning (highest-priority) values.
 */
export function resolveToMap(report: ResolveReport): EnvMap {
  const result: EnvMap = new Map();
  for (const r of report.results) {
    if (r.resolvedValue !== undefined) {
      result.set(r.key, r.resolvedValue);
    }
  }
  return result;
}
