/**
 * envStacker: stack multiple env maps in priority order,
 * where later maps override earlier ones, with full provenance tracking.
 */

export type EnvMap = Map<string, string>;

export interface StackEntry {
  key: string;
  value: string;
  source: string;
  overriddenBy?: string;
}

export interface StackResult {
  resolved: EnvMap;
  provenance: Map<string, StackEntry>;
  overrides: StackEntry[];
}

/**
 * Stack env maps in priority order (index 0 = lowest, last = highest).
 */
export function stackEnvMaps(
  maps: Array<{ name: string; env: EnvMap }>
): StackResult {
  const resolved: EnvMap = new Map();
  const provenance: Map<string, StackEntry> = new Map();
  const overrides: StackEntry[] = [];

  for (const { name, env } of maps) {
    for (const [key, value] of env.entries()) {
      const existing = provenance.get(key);
      if (existing) {
        overrides.push({ ...existing, overriddenBy: name });
      }
      provenance.set(key, { key, value, source: name });
      resolved.set(key, value);
    }
  }

  return { resolved, provenance, overrides };
}

export function formatStackReport(result: StackResult): string {
  const lines: string[] = [];

  lines.push(`Resolved keys: ${result.resolved.size}`);
  lines.push(`Override events: ${result.overrides.length}`);

  if (result.overrides.length > 0) {
    lines.push("");
    lines.push("Overrides:");
    for (const o of result.overrides) {
      lines.push(
        `  ${o.key}: [${o.source}]="${o.value}" overridden by [${o.overriddenBy}]`
      );
    }
  }

  lines.push("");
  lines.push("Final values:");
  for (const [key, entry] of result.provenance.entries()) {
    lines.push(`  ${key}=${entry.value}  (from: ${entry.source})`);
  }

  return lines.join("\n");
}

export function stackResultToJson(result: StackResult): object {
  return {
    resolvedCount: result.resolved.size,
    overrideCount: result.overrides.length,
    overrides: result.overrides.map((o) => ({
      key: o.key,
      originalValue: o.value,
      originalSource: o.source,
      overriddenBy: o.overriddenBy,
    })),
    resolved: Object.fromEntries(result.resolved),
    provenance: Object.fromEntries(
      Array.from(result.provenance.entries()).map(([k, v]) => [k, v.source])
    ),
  };
}
