import { EnvMap } from "../parser/envParser";

export interface BounceRule {
  key: string;
  allowedValues?: string[];
  blockedValues?: string[];
  pattern?: RegExp;
}

export interface BounceResult {
  key: string;
  value: string;
  allowed: boolean;
  reason?: string;
}

export interface BouncerReport {
  results: BounceResult[];
  allowed: number;
  blocked: number;
}

export function bounceEnvMap(
  env: EnvMap,
  rules: BounceRule[]
): BouncerReport {
  const results: BounceResult[] = [];

  for (const [key, value] of Object.entries(env)) {
    const rule = rules.find((r) => r.key === key);
    if (!rule) {
      results.push({ key, value, allowed: true });
      continue;
    }

    if (rule.blockedValues && rule.blockedValues.includes(value)) {
      results.push({ key, value, allowed: false, reason: `Value "${value}" is blocked` });
      continue;
    }

    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      results.push({ key, value, allowed: false, reason: `Value "${value}" not in allowed list` });
      continue;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      results.push({ key, value, allowed: false, reason: `Value "${value}" does not match pattern` });
      continue;
    }

    results.push({ key, value, allowed: true });
  }

  const blocked = results.filter((r) => !r.allowed).length;
  const allowed = results.filter((r) => r.allowed).length;
  return { results, allowed, blocked };
}

export function formatBounceReport(report: BouncerReport): string {
  const lines: string[] = [`Bouncer Report: ${report.allowed} allowed, ${report.blocked} blocked`, ""];
  for (const r of report.results) {
    const status = r.allowed ? "✓" : "✗";
    const detail = r.reason ? ` — ${r.reason}` : "";
    lines.push(`  ${status} ${r.key}=${r.value}${detail}`);
  }
  return lines.join("\n");
}

export function getBlockedKeys(report: BouncerReport): string[] {
  return report.results.filter((r) => !r.allowed).map((r) => r.key);
}
