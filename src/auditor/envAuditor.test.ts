import { auditEnvMap, formatAuditReport } from './envAuditor';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('auditEnvMap', () => {
  it('returns no issues for a clean env map', () => {
    const env = makeMap({ DATABASE_URL: 'postgres://localhost/db', PORT: '3000' });
    const result = auditEnvMap(env);
    expect(result.issues).toHaveLength(0);
    expect(result.failed).toBe(0);
  });

  it('warns on empty values', () => {
    const env = makeMap({ API_KEY: '' });
    const result = auditEnvMap(env);
    const issue = result.issues.find(i => i.key === 'API_KEY');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('errors on keys with whitespace', () => {
    const env = makeMap({ 'BAD KEY': 'value' });
    const result = auditEnvMap(env);
    const issue = result.issues.find(i => i.key === 'BAD KEY');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
  });

  it('warns on lowercase keys', () => {
    const env = makeMap({ api_key: 'secret' });
    const result = auditEnvMap(env);
    const issue = result.issues.find(i => i.key === 'api_key');
    expect(issue?.severity).toBe('warn');
  });

  it('errors on unresolved placeholder values', () => {
    const env = makeMap({ TOKEN: '<YOUR_TOKEN_HERE>', SECRET: '${SECRET_VALUE}' });
    const result = auditEnvMap(env);
    expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(2);
  });

  it('reports info for very long values', () => {
    const env = makeMap({ BIG_VALUE: 'x'.repeat(501) });
    const result = auditEnvMap(env);
    const issue = result.issues.find(i => i.key === 'BIG_VALUE');
    expect(issue?.severity).toBe('info');
  });
});

describe('formatAuditReport', () => {
  it('shows no issues message when clean', () => {
    const result = { issues: [], passed: 3, failed: 0 };
    const report = formatAuditReport(result);
    expect(report).toContain('No issues found');
    expect(report).toContain('3 passed');
  });

  it('includes severity icons and messages', () => {
    const result = {
      issues: [{ key: 'FOO', severity: 'error' as const, message: 'something wrong' }],
      passed: 0,
      failed: 1,
    };
    const report = formatAuditReport(result);
    expect(report).toContain('✖');
    expect(report).toContain('something wrong');
  });
});
