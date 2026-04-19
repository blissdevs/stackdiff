export interface TraceEntry {
  key: string;
  source: string;
  value: string;
  overriddenBy?: string;
}

export interface TraceReport {
  entries: TraceEntry[];
  overrides: Record<string, string[]>;
}

/**
 * Trace where each key originates across multiple named env maps.
 * Later sources override earlier ones.
 */
export function traceEnvMaps(
  sources: Array<{ name: string; map: Map<string, string> }>
): TraceReport {
  const originMap: Record<string, TraceEntry> = {};
  const overrides: Record<string, string[]> = {};

  for (const { name, map } of sources) {
    for (const [key, value] of map) {
      if (originMap[key]) {
        if (!overrides[key]) overrides[key] = [originMap[key].source];
        overrides[key].push(name);
        originMap[key] = { key, source: name, value, overriddenBy: undefined };
      } else {
        originMap[key] = { key, source: name, value };
      }
    }
  }

  const entries = Object.values(originMap).sort((a, b) =>
    a.key.localeCompare(b.key)
  );

  return { entries, overrides };
}

export function formatTraceReport(report: TraceReport): string {
  const lines: string[] = ["=== Env Trace Report ==="];

  for (const entry of report.entries) {
    const override = report.overrides[entry.key];
    const overrideNote = override
      ? ` (overrides: ${override.slice(0, -1).join(", ")})`
      : "";
    lines.push(`  ${entry.key} = "${entry.value}" [from: ${entry.source}${overrideNote}]`);
  }

  const overrideCount = Object.keys(report.overrides).length;
  lines.push(`\nTotal keys: ${report.entries.length}, Overridden: ${overrideCount}`);
  return lines.join("\n");
}

export function traceKey(
  key: string,
  sources: Array<{ name: string; map: Map<string, string> }>
): TraceEntry[] {
  const trace: TraceEntry[] = [];
  for (const { name, map } of sources) {
    if (map.has(key)) {
      trace.push({ key, source: name, value: map.get(key)! });
    }
  }
  return trace;
}
