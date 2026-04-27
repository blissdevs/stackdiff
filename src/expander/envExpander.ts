import { EnvMap } from "../parser/envParser";

export interface ExpandResult {
  key: string;
  originalValue: string;
  expandedValue: string;
  expanded: boolean;
}

export interface ExpandReport {
  results: ExpandResult[];
  totalExpanded: number;
  totalUnchanged: number;
}

/**
 * Expands shell-style variable references like $VAR or ${VAR} within values.
 * References are resolved against the provided context map (or the env map itself).
 */
export function expandValue(
  value: string,
  context: EnvMap,
  visited: Set<string> = new Set()
): string {
  return value.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/gi, (match, braced, bare) => {
    const ref = braced ?? bare;
    if (visited.has(ref)) return match; // prevent circular expansion
    const resolved = context.get(ref);
    if (resolved === undefined) return match;
    visited.add(ref);
    const result = expandValue(resolved, context, visited);
    visited.delete(ref);
    return result;
  });
}

export function expandEnvMap(envMap: EnvMap, context?: EnvMap): ExpandReport {
  const ctx = context ?? envMap;
  const results: ExpandResult[] = [];

  for (const [key, originalValue] of envMap.entries()) {
    const expandedValue = expandValue(originalValue, ctx);
    results.push({
      key,
      originalValue,
      expandedValue,
      expanded: expandedValue !== originalValue,
    });
  }

  return {
    results,
    totalExpanded: results.filter((r) => r.expanded).length,
    totalUnchanged: results.filter((r) => !r.expanded).length,
  };
}

export function applyExpansion(report: ExpandReport): EnvMap {
  const map: EnvMap = new Map();
  for (const { key, expandedValue } of report.results) {
    map.set(key, expandedValue);
  }
  return map;
}

export function formatExpandReport(report: ExpandReport): string {
  const lines: string[] = [
    `Expansion Report: ${report.totalExpanded} expanded, ${report.totalUnchanged} unchanged`,
    "",
  ];
  for (const r of report.results) {
    if (r.expanded) {
      lines.push(`  [~] ${r.key}: "${r.originalValue}" → "${r.expandedValue}"`);
    } else {
      lines.push(`  [ ] ${r.key}: "${r.originalValue}"`);
    }
  }
  return lines.join("\n");
}
