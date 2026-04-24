import { EnvMap } from "../parser/envParser";

export interface SampleOptions {
  count?: number;
  percent?: number;
  seed?: number;
  keys?: string[];
}

export interface SampleResult {
  sampled: EnvMap;
  total: number;
  sampleSize: number;
  excluded: string[];
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function sampleEnvMap(
  env: EnvMap,
  options: SampleOptions = {}
): SampleResult {
  const allKeys = Array.from(env.keys());
  const total = allKeys.length;

  if (options.keys && options.keys.length > 0) {
    const keySet = new Set(options.keys);
    const sampled = new Map<string, string>();
    const excluded: string[] = [];
    for (const key of allKeys) {
      if (keySet.has(key)) {
        sampled.set(key, env.get(key)!);
      } else {
        excluded.push(key);
      }
    }
    return { sampled, total, sampleSize: sampled.size, excluded };
  }

  let targetCount: number;
  if (options.percent !== undefined) {
    targetCount = Math.max(1, Math.round((options.percent / 100) * total));
  } else {
    targetCount = Math.min(options.count ?? total, total);
  }

  const rand = seededRandom(options.seed ?? 42);
  const shuffled = [...allKeys].sort(() => rand() - 0.5);
  const selectedKeys = new Set(shuffled.slice(0, targetCount));

  const sampled = new Map<string, string>();
  const excluded: string[] = [];

  for (const key of allKeys) {
    if (selectedKeys.has(key)) {
      sampled.set(key, env.get(key)!);
    } else {
      excluded.push(key);
    }
  }

  return { sampled, total, sampleSize: sampled.size, excluded };
}

export function formatSampleReport(result: SampleResult): string {
  const lines: string[] = [
    `Sample Report`,
    `  Total keys   : ${result.total}`,
    `  Sampled keys : ${result.sampleSize}`,
    `  Excluded     : ${result.excluded.length}`,
    ``,
    `Sampled Keys:`,
  ];
  for (const [key, value] of result.sampled) {
    lines.push(`  ${key}=${value}`);
  }
  if (result.excluded.length > 0) {
    lines.push(``, `Excluded Keys:`);
    for (const key of result.excluded) {
      lines.push(`  ${key}`);
    }
  }
  return lines.join("\n");
}
