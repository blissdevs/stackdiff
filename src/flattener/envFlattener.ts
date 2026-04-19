export type EnvMap = Map<string, string>;

export interface FlattenOptions {
  separator?: string;
  prefix?: string;
  maxDepth?: number;
}

export interface FlattenReport {
  original: number;
  flattened: number;
  skipped: number;
  keys: string[];
}

export function flattenNestedEnv(
  obj: Record<string, unknown>,
  options: FlattenOptions = {}
): EnvMap {
  const { separator = "__", prefix = "", maxDepth = 10 } = options;
  const result = new Map<string, string>();

  function recurse(current: unknown, keyPath: string, depth: number): void {
    if (depth > maxDepth) return;
    if (current === null || current === undefined) return;

    if (typeof current === "object" && !Array.isArray(current)) {
      for (const [k, v] of Object.entries(current as Record<string, unknown>)) {
        const newKey = keyPath ? `${keyPath}${separator}${k}` : k;
        recurse(v, newKey, depth + 1);
      }
    } else if (Array.isArray(current)) {
      current.forEach((item, i) => {
        recurse(item, `${keyPath}${separator}${i}`, depth + 1);
      });
    } else {
      const finalKey = (prefix ? `${prefix}${separator}${keyPath}` : keyPath).toUpperCase();
      result.set(finalKey, String(current));
    }
  }

  recurse(obj, "", 0);
  return result;
}

export function unflattenEnvMap(
  map: EnvMap,
  separator = "__"
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of map) {
    const parts = key.toLowerCase().split(separator);
    let cursor: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in cursor)) cursor[parts[i]] = {};
      cursor = cursor[parts[i]] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return result;
}

export function formatFlattenReport(report: FlattenReport): string {
  const lines = [
    `Flatten Report`,
    `  Original keys : ${report.original}`,
    `  Flattened keys: ${report.flattened}`,
    `  Skipped       : ${report.skipped}`,
    `  Keys          : ${report.keys.join(", ") || "(none)"}`,
  ];
  return lines.join("\n");
}

export function buildFlattenReport(
  original: Record<string, unknown>,
  result: EnvMap
): FlattenReport {
  const originalCount = Object.keys(original).length;
  return {
    original: originalCount,
    flattened: result.size,
    skipped: 0,
    keys: Array.from(result.keys()),
  };
}
