import { EnvMap } from "../parser/envParser";

export interface CountResult {
  total: number;
  empty: number;
  nonEmpty: number;
  byPrefix: Record<string, number>;
}

export interface CountReport {
  label: string;
  result: CountResult;
}

export function countEnvMap(env: EnvMap, label = "env"): CountReport {
  let empty = 0;
  let nonEmpty = 0;
  const byPrefix: Record<string, number> = {};

  for (const [key, value] of Object.entries(env)) {
    if (value === "" || value === undefined) {
      empty++;
    } else {
      nonEmpty++;
    }

    const underscoreIdx = key.indexOf("_");
    const prefix = underscoreIdx > 0 ? key.slice(0, underscoreIdx) : "(none)";
    byPrefix[prefix] = (byPrefix[prefix] ?? 0) + 1;
  }

  return {
    label,
    result: {
      total: empty + nonEmpty,
      empty,
      nonEmpty,
      byPrefix,
    },
  };
}

export function formatCountReport(report: CountReport): string {
  const { label, result } = report;
  const lines: string[] = [
    `Count report for [${label}]`,
    `  Total   : ${result.total}`,
    `  Non-empty: ${result.nonEmpty}`,
    `  Empty   : ${result.empty}`,
    `  By prefix:`,
  ];

  for (const [prefix, count] of Object.entries(result.byPrefix).sort()) {
    lines.push(`    ${prefix}: ${count}`);
  }

  return lines.join("\n");
}

export function countToJson(report: CountReport): string {
  return JSON.stringify({ label: report.label, ...report.result }, null, 2);
}
