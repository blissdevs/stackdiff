/**
 * envCaster: cast env variable string values to typed representations
 */

export type CastType = 'string' | 'number' | 'boolean' | 'json' | 'array';

export interface CastRule {
  key: string;
  type: CastType;
}

export interface CastResult {
  key: string;
  original: string;
  casted: unknown;
  type: CastType;
  success: boolean;
  error?: string;
}

export interface CastReport {
  results: CastResult[];
  successCount: number;
  failureCount: number;
}

export function castValue(value: string, type: CastType): { casted: unknown; error?: string } {
  try {
    switch (type) {
      case 'number': {
        const n = Number(value);
        if (isNaN(n)) throw new Error(`Cannot cast "${value}" to number`);
        return { casted: n };
      }
      case 'boolean': {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1' || lower === 'yes') return { casted: true };
        if (lower === 'false' || lower === '0' || lower === 'no') return { casted: false };
        throw new Error(`Cannot cast "${value}" to boolean`);
      }
      case 'json': {
        return { casted: JSON.parse(value) };
      }
      case 'array': {
        return { casted: value.split(',').map((s) => s.trim()) };
      }
      case 'string':
      default:
        return { casted: value };
    }
  } catch (err) {
    return { casted: undefined, error: (err as Error).message };
  }
}

export function castEnvMap(
  env: Map<string, string>,
  rules: CastRule[]
): CastReport {
  const ruleMap = new Map(rules.map((r) => [r.key, r.type]));
  const results: CastResult[] = [];

  for (const [key, value] of env.entries()) {
    const type: CastType = ruleMap.get(key) ?? 'string';
    const { casted, error } = castValue(value, type);
    results.push({
      key,
      original: value,
      casted,
      type,
      success: !error,
      ...(error ? { error } : {}),
    });
  }

  return {
    results,
    successCount: results.filter((r) => r.success).length,
    failureCount: results.filter((r) => !r.success).length,
  };
}

export function formatCastReport(report: CastReport): string {
  const lines: string[] = [`Cast Report — ${report.successCount} ok, ${report.failureCount} failed`];
  for (const r of report.results) {
    const status = r.success ? '✓' : '✗';
    const detail = r.success
      ? `${r.original} → ${JSON.stringify(r.casted)} (${r.type})`
      : `${r.original} — ${r.error}`;
    lines.push(`  ${status} ${r.key}: ${detail}`);
  }
  return lines.join('\n');
}
