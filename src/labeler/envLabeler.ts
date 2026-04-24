import { EnvMap } from "../parser/envParser";

export type LabelRule = {
  pattern: RegExp;
  label: string;
};

export type LabeledEntry = {
  key: string;
  value: string;
  labels: string[];
};

export type LabelReport = {
  labeled: LabeledEntry[];
  unlabeled: string[];
  labelCounts: Record<string, number>;
};

const DEFAULT_RULES: LabelRule[] = [
  { pattern: /^DB_|_DATABASE_|_DB$/i, label: "database" },
  { pattern: /^REDIS_|_REDIS_/i, label: "cache" },
  { pattern: /SECRET|PASSWORD|TOKEN|API_KEY|PRIVATE/i, label: "secret" },
  { pattern: /^AWS_|^GCP_|^AZURE_/i, label: "cloud" },
  { pattern: /^LOG_|_LOG$/i, label: "logging" },
  { pattern: /^PORT$|_PORT$/i, label: "network" },
  { pattern: /^HOST$|_HOST$/i, label: "network" },
  { pattern: /^URL$|_URL$/i, label: "network" },
];

export function labelEnvMap(
  env: EnvMap,
  rules: LabelRule[] = DEFAULT_RULES
): LabeledEntry[] {
  return Array.from(env.entries()).map(([key, value]) => {
    const labels = rules
      .filter((r) => r.pattern.test(key))
      .map((r) => r.label);
    return { key, value, labels: [...new Set(labels)] };
  });
}

export function filterByLabel(
  entries: LabeledEntry[],
  label: string
): LabeledEntry[] {
  return entries.filter((e) => e.labels.includes(label));
}

export function formatLabelReport(report: LabelReport): string {
  const lines: string[] = ["=== Label Report ==="];
  const labelNames = Object.keys(report.labelCounts);
  if (labelNames.length > 0) {
    lines.push("\nLabel Counts:");
    for (const label of labelNames) {
      lines.push(`  ${label}: ${report.labelCounts[label]}`);
    }
  }
  if (report.unlabeled.length > 0) {
    lines.push(`\nUnlabeled keys (${report.unlabeled.length}): ${report.unlabeled.join(", ")}`);
  }
  return lines.join("\n");
}

export function buildLabelReport(
  env: EnvMap,
  rules: LabelRule[] = DEFAULT_RULES
): LabelReport {
  const labeled = labelEnvMap(env, rules);
  const unlabeled = labeled.filter((e) => e.labels.length === 0).map((e) => e.key);
  const labelCounts: Record<string, number> = {};
  for (const entry of labeled) {
    for (const label of entry.labels) {
      labelCounts[label] = (labelCounts[label] ?? 0) + 1;
    }
  }
  return { labeled, unlabeled, labelCounts };
}
