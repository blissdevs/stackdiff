import { EnvMap } from '../parser/envParser';

export type AuditSeverity = 'error' | 'warn' | 'info';

export interface AuditIssue {
  key: string;
  severity: AuditSeverity;
  message: string;
}

export interface AuditResult {
  issues: AuditIssue[];
  passed: number;
  failed: number;
}

const EMPTY_VALUE_KEYS_WHITELIST = ['OPTIONAL_FEATURE', 'DEBUG'];

export function auditEnvMap(env: EnvMap): AuditResult {
  const issues: AuditIssue[] = [];

  for (const [key, value] of env.entries()) {
    // Check for empty values
    if (value.trim() === '' && !EMPTY_VALUE_KEYS_WHITELIST.includes(key)) {
      issues.push({ key, severity: 'warn', message: `Key "${key}" has an empty value` });
    }

    // Check for keys with spaces
    if (/\s/.test(key)) {
      issues.push({ key, severity: 'error', message: `Key "${key}" contains whitespace` });
    }

    // Check for lowercase keys (convention: env vars should be uppercase)
    if (key !== key.toUpperCase()) {
      issues.push({ key, severity: 'warn', message: `Key "${key}" is not uppercase` });
    }

    // Check for values that look like unresolved placeholders
    if (/^<.+>$/.test(value.trim()) || /^\$\{.+\}$/.test(value.trim())) {
      issues.push({ key, severity: 'error', message: `Key "${key}" appears to have an unresolved placeholder: ${value}` });
    }

    // Check for suspiciously long values (possible accidental paste)
    if (value.length > 500) {
      issues.push({ key, severity: 'info', message: `Key "${key}" has an unusually long value (${value.length} chars)` });
    }
  }

  const failed = issues.filter(i => i.severity === 'error').length;
  const passed = env.size - failed;

  return { issues, passed, failed };
}

export function formatAuditReport(result: AuditResult): string {
  const lines: string[] = [`Audit: ${result.passed} passed, ${result.failed} failed\n`];
  for (const issue of result.issues) {
    const icon = issue.severity === 'error' ? '✖' : issue.severity === 'warn' ? '⚠' : 'ℹ';
    lines.push(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`);
  }
  if (result.issues.length === 0) {
    lines.push('  ✔ No issues found.');
  }
  return lines.join('\n');
}
