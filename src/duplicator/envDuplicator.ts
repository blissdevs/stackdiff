import { EnvMap } from "../parser/envParser";

export interface DuplicateEntry {
  key: string;
  value: string;
  sources: string[];
}

export interface DuplicateReport {
  duplicates: DuplicateEntry[];
  totalDuplicates: number;
  affectedSources: string[];
}

/**
 * Find keys that appear in multiple env maps with identical values.
 */
export function findDuplicates(
  maps: Record<string, EnvMap>
): DuplicateEntry[] {
  const keyValues: Record<string, { value: string; sources: string[] }> = {};

  for (const [source, map] of Object.entries(maps)) {
    for (const [key, value] of map.entries()) {
      if (!keyValues[key]) {
        keyValues[key] = { value, sources: [] };
      }
      if (keyValues[key].value === value) {
        keyValues[key].sources.push(source);
      }
    }
  }

  return Object.entries(keyValues)
    .filter(([, { sources }]) => sources.length > 1)
    .map(([key, { value, sources }]) => ({ key, value, sources }));
}

/**
 * Build a full duplicate report from multiple env maps.
 */
export function buildDuplicateReport(
  maps: Record<string, EnvMap>
): DuplicateReport {
  const duplicates = findDuplicates(maps);
  const affectedSources = [
    ...new Set(duplicates.flatMap((d) => d.sources)),
  ];

  return {
    duplicates,
    totalDuplicates: duplicates.length,
    affectedSources,
  };
}

/**
 * Format a duplicate report as a human-readable string.
 */
export function formatDuplicateReport(report: DuplicateReport): string {
  if (report.totalDuplicates === 0) {
    return "No duplicate keys found across sources.";
  }

  const lines: string[] = [
    `Found ${report.totalDuplicates} duplicate key(s) across: ${report.affectedSources.join(", ")}`,
    "",
  ];

  for (const entry of report.duplicates) {
    lines.push(`  ${entry.key} = "${entry.value}"`);
    lines.push(`    present in: ${entry.sources.join(", ")}`);
  }

  return lines.join("\n");
}
