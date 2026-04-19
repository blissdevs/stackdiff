export type EnvMap = Map<string, string>;

export interface SplitResult {
  chunks: EnvMap[];
  chunkSize: number;
  total: number;
}

export function splitEnvMap(env: EnvMap, chunkSize: number): EnvMap[] {
  if (chunkSize <= 0) throw new Error("chunkSize must be greater than 0");
  const entries = Array.from(env.entries());
  const chunks: EnvMap[] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(new Map(entries.slice(i, i + chunkSize)));
  }
  return chunks;
}

export function splitByPredicate(
  env: EnvMap,
  predicate: (key: string, value: string) => boolean
): [EnvMap, EnvMap] {
  const matched: EnvMap = new Map();
  const unmatched: EnvMap = new Map();
  for (const [key, value] of env) {
    if (predicate(key, value)) {
      matched.set(key, value);
    } else {
      unmatched.set(key, value);
    }
  }
  return [matched, unmatched];
}

export function splitByPrefix(env: EnvMap, prefixes: string[]): Record<string, EnvMap> {
  const result: Record<string, EnvMap> = { _other: new Map() };
  for (const prefix of prefixes) {
    result[prefix] = new Map();
  }
  for (const [key, value] of env) {
    const match = prefixes.find((p) => key.startsWith(p));
    if (match) {
      result[match].set(key, value);
    } else {
      result["_other"].set(key, value);
    }
  }
  return result;
}

export function formatSplitReport(result: SplitResult): string {
  const lines: string[] = [
    `Split Report`,
    `  Total keys : ${result.total}`,
    `  Chunk size : ${result.chunkSize}`,
    `  Chunks     : ${result.chunks.length}`,
  ];
  result.chunks.forEach((chunk, i) => {
    lines.push(`  Chunk ${i + 1}: ${chunk.size} keys`);
  });
  return lines.join("\n");
}
