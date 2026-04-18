import { lintEnvMap, formatLintReport, defaultRules } from './envLinter';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('lintEnvMap', () => {
  it('returns no issues for a clean env map', () => {
    const env = makeMap({ DATABASE_URL: 'postgres://localhost', PORT: '3000' });
    expect(lintEnvMap(env)).toEqual([]);
  });

  it('flags empty values', () => {
    const env = makeMap({ API_KEY: '' });
    const results = lintEnvMap(env);
    expect(results.some((r) => r.rule === 'no-empty-value')).toBe(true);
  });

  it('flags lowercase keys', () => {
    const env = makeMap({ api_key: 'abc' });
    const results = lintEnvMap(env);
    expect(results.some((r) => r.rule === 'uppercase-key')).toBe(true);
  });

  it('flags keys with spaces', () => {
    const env = makeMap({ 'MY KEY': 'val' });
    const results = lintEnvMap(env);
    expect(results.some((r) => r.rule === 'no-whitespace-key')).toBe(true);
  });

  it('flags keys with special characters', () => {
    const env = makeMap({ 'MY-KEY': 'val' });
    const results = lintEnvMap(env);
    expect(results.some((r) => r.rule === 'no-special-chars-key')).toBe(true);
  });

  it('flags keys starting with a digit', () => {
    const env = makeMap({ '1KEY': 'val' });
    const results = lintEnvMap(env);
    expect(results.some((r) => r.rule === 'no-leading-digit-key')).toBe(true);
  });

  it('supports custom rules', () => {
    const env = makeMap({ SECRET: 'hunter2' });
    const rule = {
      name: 'no-weak-secret',
      check: (_k: string, v: string) =>
        v === 'hunter2' ? 'Weak secret detected' : null,
    };
    const results = lintEnvMap(env, [rule]);
    expect(results).toHaveLength(1);
    expect(results[0].message).toBe('Weak secret detected');
  });
});

describe('formatLintReport', () => {
  it('returns success message when no issues', () => {
    expect(formatLintReport([])).toContain('No lint issues found');
  });

  it('lists issues when present', () => {
    const results = [{ key: 'bad key', rule: 'no-whitespace-key', message: 'Key "bad key" contains whitespace' }];
    const report = formatLintReport(results);
    expect(report).toContain('1 lint issue(s)');
    expect(report).toContain('no-whitespace-key');
  });
});
