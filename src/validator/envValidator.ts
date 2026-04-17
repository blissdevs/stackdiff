export interface ValidationRule {
  key: string;
  required?: boolean;
  pattern?: RegExp;
  allowedValues?: string[];
}

export interface ValidationResult {
  key: string;
  valid: boolean;
  message?: string;
}

export interface ValidationReport {
  passed: ValidationResult[];
  failed: ValidationResult[];
  isValid: boolean;
}

export function validateEnvMap(
  env: Record<string, string>,
  rules: ValidationRule[]
): ValidationReport {
  const passed: ValidationResult[] = [];
  const failed: ValidationResult[] = [];

  for (const rule of rules) {
    const value = env[rule.key];

    if (rule.required && (value === undefined || value === '')) {
      failed.push({ key: rule.key, valid: false, message: `Key "${rule.key}" is required but missing or empty` });
      continue;
    }

    if (value === undefined) {
      passed.push({ key: rule.key, valid: true });
      continue;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      failed.push({ key: rule.key, valid: false, message: `Key "${rule.key}" does not match pattern ${rule.pattern}` });
      continue;
    }

    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      failed.push({
        key: rule.key,
        valid: false,
        message: `Key "${rule.key}" value "${value}" not in allowed values: ${rule.allowedValues.join(', ')}`
      });
      continue;
    }

    passed.push({ key: rule.key, valid: true });
  }

  return { passed, failed, isValid: failed.length === 0 };
}

export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];
  if (report.isValid) {
    lines.push(`✔ All ${report.passed.length} rule(s) passed.`);
  } else {
    lines.push(`✘ ${report.failed.length} rule(s) failed:`);
    for (const f of report.failed) {
      lines.push(`  - ${f.message}`);
    }
    if (report.passed.length > 0) {
      lines.push(`✔ ${report.passed.length} rule(s) passed.`);
    }
  }
  return lines.join('\n');
}
