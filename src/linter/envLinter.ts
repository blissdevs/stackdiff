export interface LintRule {
  name: string;
  check: (key: string, value: string) => string | null;
}

export interface LintResult {
  key: string;
  rule: string;
  message: string;
}

export const defaultRules: LintRule[] = [
  {
    name: 'no-empty-value',
    check: (key, value) =>
      value.trim() === '' ? `Key "${key}" has an empty value` : null,
  },
  {
    name: 'no-whitespace-key',
    check: (key) =>
      /\s/.test(key) ? `Key "${key}" contains whitespace` : null,
  },
  {
    name: 'uppercase-key',
    check: (key) =>
      key !== key.toUpperCase() ? `Key "${key}" is not uppercase` : null,
  },
  {
    name: 'no-special-chars-key',
    check: (key) =>
      /[^A-Z0-9_]/.test(key)
        ? `Key "${key}" contains invalid characters (only A-Z, 0-9, _ allowed)`
        : null,
  },
  {
    name: 'no-leading-digit-key',
    check: (key) =>
      /^[0-9]/.test(key) ? `Key "${key}" starts with a digit` : null,
  },
];

export function lintEnvMap(
  env: Map<string, string>,
  rules: LintRule[] = defaultRules
): LintResult[] {
  const results: LintResult[] = [];
  for (const [key, value] of env.entries()) {
    for (const rule of rules) {
      const message = rule.check(key, value);
      if (message) {
        results.push({ key, rule: rule.name, message });
      }
    }
  }
  return results;
}

export function formatLintReport(results: LintResult[]): string {
  if (results.length === 0) return '✔ No lint issues found.';
  const lines = results.map(
    (r) => `  [${r.rule}] ${r.message}`
  );
  return `✖ ${results.length} lint issue(s) found:\n${lines.join('\n')}`;
}
