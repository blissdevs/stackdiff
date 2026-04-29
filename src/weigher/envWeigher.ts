/**
 * envWeigher.ts
 * Assigns a numeric "weight" to each env key based on configurable criteria
 * (key length, value length, sensitivity, prefix depth, etc.) and produces
 * a ranked report.
 */

export interface WeightOptions {
  keyLengthFactor?: number;    // multiplier per character of key length
  valueLengthFactor?: number;  // multiplier per character of value length
  sensitiveBonus?: number;     // flat bonus for sensitive-looking keys
  prefixDepthFactor?: number;  // multiplier per underscore-separated segment
}

export interface WeightEntry {
  key: string;
  value: string;
  weight: number;
  breakdown: Record<string, number>;
}

export interface WeightResult {
  entries: WeightEntry[];
  totalWeight: number;
  heaviestKey: string | null;
  lightestKey: string | null;
}

const SENSITIVE_PATTERN = /secret|password|token|key|auth|credential|private/i;

const DEFAULT_OPTIONS: Required<WeightOptions> = {
  keyLengthFactor: 0.5,
  valueLengthFactor: 0.2,
  sensitiveBonus: 10,
  prefixDepthFactor: 2,
};

export function weightKey(
  key: string,
  value: string,
  options: WeightOptions = {}
): WeightEntry {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const keyLen = key.length * opts.keyLengthFactor;
  const valLen = value.length * opts.valueLengthFactor;
  const sensitive = SENSITIVE_PATTERN.test(key) ? opts.sensitiveBonus : 0;
  const depth = (key.split('_').length - 1) * opts.prefixDepthFactor;
  const weight = Math.round(keyLen + valLen + sensitive + depth);
  return {
    key,
    value,
    weight,
    breakdown: { keyLen, valLen, sensitive, depth },
  };
}

export function weighEnvMap(
  env: Map<string, string>,
  options: WeightOptions = {}
): WeightResult {
  const entries: WeightEntry[] = [];
  for (const [key, value] of env.entries()) {
    entries.push(weightKey(key, value, options));
  }
  entries.sort((a, b) => b.weight - a.weight);
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  return {
    entries,
    totalWeight,
    heaviestKey: entries[0]?.key ?? null,
    lightestKey: entries[entries.length - 1]?.key ?? null,
  };
}

export function formatWeightReport(result: WeightResult): string {
  const lines: string[] = ['ENV WEIGHT REPORT', '================='];
  for (const e of result.entries) {
    lines.push(`  ${e.key.padEnd(32)} weight=${e.weight}`);
  }
  lines.push('');
  lines.push(`Total weight : ${result.totalWeight}`);
  lines.push(`Heaviest key : ${result.heaviestKey ?? '—'}`);
  lines.push(`Lightest key : ${result.lightestKey ?? '—'}`);
  return lines.join('\n');
}

export function weightResultToJson(result: WeightResult): string {
  return JSON.stringify(result, null, 2);
}
