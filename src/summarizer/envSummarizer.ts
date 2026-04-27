import { EnvMap } from "../parser/envParser";

export interface EnvSummary {
  totalKeys: number;
  emptyValues: number;
  uniquePrefixes: string[];
  longestKey: string;
  shortestKey: string;
  averageValueLength: number;
  keysWithSpecialChars: string[];
}

export function summarizeEnvMap(env: EnvMap): EnvSummary {
  const keys = Array.from(env.keys());
  if (keys.length === 0) {
    return {
      totalKeys: 0,
      emptyValues: 0,
      uniquePrefixes: [],
      longestKey: "",
      shortestKey: "",
      averageValueLength: 0,
      keysWithSpecialChars: [],
    };
  }

  const emptyValues = keys.filter((k) => (env.get(k) ?? "") === "").length;

  const prefixSet = new Set<string>();
  for (const key of keys) {
    const parts = key.split("_");
    if (parts.length > 1) prefixSet.add(parts[0]);
  }

  const longestKey = keys.reduce((a, b) => (a.length >= b.length ? a : b), "");
  const shortestKey = keys.reduce((a, b) => (a.length <= b.length ? a : b), keys[0]);

  const totalValueLength = keys.reduce((sum, k) => sum + (env.get(k) ?? "").length, 0);
  const averageValueLength = Math.round((totalValueLength / keys.length) * 100) / 100;

  const specialCharRegex = /[^A-Z0-9_]/;
  const keysWithSpecialChars = keys.filter((k) => specialCharRegex.test(k));

  return {
    totalKeys: keys.length,
    emptyValues,
    uniquePrefixes: Array.from(prefixSet).sort(),
    longestKey,
    shortestKey,
    averageValueLength,
    keysWithSpecialChars,
  };
}

export function formatSummaryReport(summary: EnvSummary): string {
  const lines: string[] = [
    `Total keys:            ${summary.totalKeys}`,
    `Empty values:          ${summary.emptyValues}`,
    `Unique prefixes:       ${summary.uniquePrefixes.join(", ") || "(none)"}`,
    `Longest key:           ${summary.longestKey || "(none)"}`,
    `Shortest key:          ${summary.shortestKey || "(none)"}`,
    `Avg value length:      ${summary.averageValueLength}`,
    `Keys w/ special chars: ${summary.keysWithSpecialChars.join(", ") || "(none)"}`,
  ];
  return lines.join("\n");
}

export function summaryToJson(summary: EnvSummary): string {
  return JSON.stringify(summary, null, 2);
}
