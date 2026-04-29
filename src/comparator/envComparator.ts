/**
 * envComparator.ts
 *
 * Deep structural comparison of multiple env maps, producing a matrix-style
 * report showing how each key/value aligns (or diverges) across N sources.
 */

export type EnvMap = Map<string, string>;

export interface ComparatorCell {
  value: string | undefined;
  present: boolean;
}

export interface ComparatorRow {
  key: string;
  cells: Record<string, ComparatorCell>;
  /** true when all present values are identical */
  allMatch: boolean;
  /** true when the key is missing from at least one source */
  hasGap: boolean;
}

export interface ComparatorResult {
  sources: string[];
  rows: ComparatorRow[];
  totalKeys: number;
  matchingKeys: number;
  divergentKeys: number;
  gapKeys: number;
}

/**
 * Compare N named env maps and produce a full matrix result.
 */
export function compareEnvMapsMatrix(
  sources: Record<string, EnvMap>
): ComparatorResult {
  const names = Object.keys(sources);
  const allKeys = new Set<string>();

  for (const map of Object.values(sources)) {
    for (const key of map.keys()) {
      allKeys.add(key);
    }
  }

  const rows: ComparatorRow[] = [];
  let matchingKeys = 0;
  let divergentKeys = 0;
  let gapKeys = 0;

  for (const key of Array.from(allKeys).sort()) {
    const cells: Record<string, ComparatorCell> = {};
    const presentValues: string[] = [];

    for (const name of names) {
      const map = sources[name];
      const present = map.has(key);
      const value = map.get(key);
      cells[name] = { value, present };
      if (present && value !== undefined) {
        presentValues.push(value);
      }
    }

    const hasGap = names.some((n) => !cells[n].present);
    const allMatch =
      presentValues.length === names.length &&
      presentValues.every((v) => v === presentValues[0]);

    rows.push({ key, cells, allMatch, hasGap });

    if (allMatch && !hasGap) {
      matchingKeys++;
    } else if (hasGap) {
      gapKeys++;
    } else {
      divergentKeys++;
    }
  }

  return {
    sources: names,
    rows,
    totalKeys: allKeys.size,
    matchingKeys,
    divergentKeys,
    gapKeys,
  };
}

/**
 * Format a comparator result as a human-readable text table.
 */
export function formatComparatorReport(
  result: ComparatorResult,
  { showMatchingRows = false }: { showMatchingRows?: boolean } = {}
): string {
  const lines: string[] = [];
  const { sources, rows, totalKeys, matchingKeys, divergentKeys, gapKeys } =
    result;

  lines.push(`Comparator report — ${sources.length} sources: ${sources.join(", ")}`);
  lines.push(
    `Keys: ${totalKeys} total | ${matchingKeys} matching | ${divergentKeys} divergent | ${gapKeys} with gaps`
  );
  lines.push("");

  const filtered = showMatchingRows
    ? rows
    : rows.filter((r) => !r.allMatch || r.hasGap);

  if (filtered.length === 0) {
    lines.push("All keys match across all sources.");
    return lines.join("\n");
  }

  for (const row of filtered) {
    const status = row.allMatch ? "✓" : row.hasGap ? "~" : "✗";
    lines.push(`  [${status}] ${row.key}`);
    for (const src of sources) {
      const cell = row.cells[src];
      const display = cell.present ? `"${cell.value}"` : "<missing>";
      lines.push(`        ${src}: ${display}`);
    }
  }

  return lines.join("\n");
}

/**
 * Serialize a comparator result to a JSON-friendly plain object.
 */
export function comparatorResultToJson(
  result: ComparatorResult
): Record<string, unknown> {
  return {
    sources: result.sources,
    totalKeys: result.totalKeys,
    matchingKeys: result.matchingKeys,
    divergentKeys: result.divergentKeys,
    gapKeys: result.gapKeys,
    rows: result.rows.map((row) => ({
      key: row.key,
      allMatch: row.allMatch,
      hasGap: row.hasGap,
      cells: row.cells,
    })),
  };
}
