import { EnvMap } from "../parser/envParser";

export type CompareResult = {
  key: string;
  leftValue: string | undefined;
  rightValue: string | undefined;
  status: "match" | "mismatch" | "left_only" | "right_only";
};

export type CompareReport = {
  results: CompareResult[];
  matchCount: number;
  mismatchCount: number;
  leftOnlyCount: number;
  rightOnlyCount: number;
};

export function compareEnvMaps(left: EnvMap, right: EnvMap): CompareReport {
  const allKeys = new Set([...left.keys(), ...right.keys()]);
  const results: CompareResult[] = [];

  for (const key of allKeys) {
    const leftValue = left.get(key);
    const rightValue = right.get(key);

    let status: CompareResult["status"];
    if (leftValue === undefined) status = "right_only";
    else if (rightValue === undefined) status = "left_only";
    else if (leftValue === rightValue) status = "match";
    else status = "mismatch";

    results.push({ key, leftValue, rightValue, status });
  }

  results.sort((a, b) => a.key.localeCompare(b.key));

  return {
    results,
    matchCount: results.filter((r) => r.status === "match").length,
    mismatchCount: results.filter((r) => r.status === "mismatch").length,
    leftOnlyCount: results.filter((r) => r.status === "left_only").length,
    rightOnlyCount: results.filter((r) => r.status === "right_only").length,
  };
}

export function formatCompareReport(report: CompareReport): string {
  const lines: string[] = [];
  for (const r of report.results) {
    if (r.status === "match") lines.push(`  = ${r.key}`);
    else if (r.status === "mismatch") lines.push(`  ~ ${r.key}: "${r.leftValue}" vs "${r.rightValue}"`);
    else if (r.status === "left_only") lines.push(`  < ${r.key}: "${r.leftValue}"`);
    else lines.push(`  > ${r.key}: "${r.rightValue}"`);
  }
  lines.push(
    `\nSummary: ${report.matchCount} match, ${report.mismatchCount} mismatch, ` +
      `${report.leftOnlyCount} left-only, ${report.rightOnlyCount} right-only`
  );
  return lines.join("\n");
}
