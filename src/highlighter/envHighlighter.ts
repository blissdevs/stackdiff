import { EnvMap } from "../parser/envParser";

export type HighlightRule = {
  pattern: RegExp | string;
  label: string;
  color: string;
};

export type HighlightResult = {
  key: string;
  value: string;
  matchedRules: string[];
};

export type HighlightReport = {
  matches: HighlightResult[];
  totalHighlighted: number;
  totalKeys: number;
};

const ANSI: Record<string, string> = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

export function matchesRule(key: string, rule: HighlightRule): boolean {
  if (rule.pattern instanceof RegExp) {
    return rule.pattern.test(key);
  }
  return key.includes(rule.pattern);
}

export function highlightEnvMap(
  env: EnvMap,
  rules: HighlightRule[]
): HighlightReport {
  const matches: HighlightResult[] = [];

  for (const [key, value] of env.entries()) {
    const matchedRules = rules
      .filter((r) => matchesRule(key, r))
      .map((r) => r.label);

    if (matchedRules.length > 0) {
      matches.push({ key, value, matchedRules });
    }
  }

  return {
    matches,
    totalHighlighted: matches.length,
    totalKeys: env.size,
  };
}

export function formatHighlightReport(
  report: HighlightReport,
  rules: HighlightRule[],
  useColor = true
): string {
  const lines: string[] = [];
  lines.push(`Highlighted ${report.totalHighlighted} / ${report.totalKeys} keys:\n`);

  for (const match of report.matches) {
    const rule = rules.find((r) => match.matchedRules.includes(r.label));
    const color = rule ? (ANSI[rule.color] ?? "") : "";
    const reset = useColor ? ANSI.reset : "";
    const prefix = useColor && color ? color : "";
    const labels = match.matchedRules.join(", ");
    lines.push(`  ${prefix}${match.key}${reset} = ${match.value}  [${labels}]`);
  }

  return lines.join("\n");
}
