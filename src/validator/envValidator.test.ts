import { validateEnvMap, formatValidationReport, ValidationRule } from './envValidator';

const sampleEnv: Record<string, string> = {
  NODE_ENV: 'production',
  PORT: '8080',
  DATABASE_URL: 'postgres://localhost/db',
};

const rules: ValidationRule[] = [
  { key: 'NODE_ENV', required: true, allowedValues: ['development', 'staging', 'production'] },
  { key: 'PORT', required: true, pattern: /^\d+$/ },
  { key: 'DATABASE_URL', required: true },
  { key: 'OPTIONAL_KEY', required: false },
];

describe('validateEnvMap', () => {
  it('passes all rules for valid env', () => {
    const report = validateEnvMap(sampleEnv, rules);
    expect(report.isValid).toBe(true);
    expect(report.failed).toHaveLength(0);
    expect(report.passed.length).toBeGreaterThan(0);
  });

  it('fails when required key is missing', () => {
    const env = { PORT: '3000' };
    const report = validateEnvMap(env, [{ key: 'NODE_ENV', required: true }]);
    expect(report.isValid).toBe(false);
    expect(report.failed[0].key).toBe('NODE_ENV');
  });

  it('fails when value does not match pattern', () => {
    const env = { PORT: 'abc' };
    const report = validateEnvMap(env, [{ key: 'PORT', pattern: /^\d+$/ }]);
    expect(report.isValid).toBe(false);
    expect(report.failed[0].message).toContain('does not match pattern');
  });

  it('fails when value not in allowedValues', () => {
    const env = { NODE_ENV: 'unknown' };
    const report = validateEnvMap(env, [{ key: 'NODE_ENV', allowedValues: ['development', 'production'] }]);
    expect(report.isValid).toBe(false);
    expect(report.failed[0].message).toContain('not in allowed values');
  });

  it('passes optional missing key', () => {
    const env = {};
    const report = validateEnvMap(env, [{ key: 'OPTIONAL_KEY', required: false }]);
    expect(report.isValid).toBe(true);
  });
});

describe('formatValidationReport', () => {
  it('returns success message when all pass', () => {
    const report = validateEnvMap(sampleEnv, rules);
    const output = formatValidationReport(report);
    expect(output).toContain('✔');
    expect(output).toContain('passed');
  });

  it('returns failure details when rules fail', () => {
    const env = {};
    const report = validateEnvMap(env, [{ key: 'NODE_ENV', required: true }]);
    const output = formatValidationReport(report);
    expect(output).toContain('✘');
    expect(output).toContain('NODE_ENV');
  });
});
