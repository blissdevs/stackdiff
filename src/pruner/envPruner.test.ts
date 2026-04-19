import { pruneEnvMap, formatPruneReport } from './envPruner';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('pruneEnvMap', () => {
  it('removes empty values when removeEmpty is true', () => {
    const env = makeMap({ A: 'hello', B: '', C: 'world', D: '' });
    const report = pruneEnvMap(env, { removeEmpty: true });
    expect(report.removed).toEqual(['B', 'D']);
    expect(report.result.has('A')).toBe(true);
    expect(report.result.has('B')).toBe(false);
    expect(report.pruned).toBe(2);
  });

  it('removes specified keys', () => {
    const env = makeMap({ A: '1', B: '2', C: '3' });
    const report = pruneEnvMap(env, { removeKeys: ['B', 'C'] });
    expect(report.removed).toContain('B');
    expect(report.removed).toContain('C');
    expect(report.result.size).toBe(1);
  });

  it('removes duplicate values when removeDuplicateValues is true', () => {
    const env = makeMap({ A: 'same', B: 'other', C: 'same' });
    const report = pruneEnvMap(env, { removeDuplicateValues: true });
    expect(report.removed).toContain('C');
    expect(report.result.size).toBe(2);
  });

  it('returns full map when no options set', () => {
    const env = makeMap({ A: '1', B: '2' });
    const report = pruneEnvMap(env);
    expect(report.removed).toHaveLength(0);
    expect(report.pruned).toBe(2);
  });

  it('handles empty map', () => {
    const report = pruneEnvMap(new Map(), { removeEmpty: true });
    expect(report.original).toBe(0);
    expect(report.removed).toHaveLength(0);
  });
});

describe('formatPruneReport', () => {
  it('shows removed keys', () => {
    const env = makeMap({ A: '', B: 'val' });
    const report = pruneEnvMap(env, { removeEmpty: true });
    const output = formatPruneReport(report);
    expect(output).toContain('Prune Report');
    expect(output).toContain('- A');
  });

  it('shows no keys removed message', () => {
    const env = makeMap({ A: 'val' });
    const report = pruneEnvMap(env);
    const output = formatPruneReport(report);
    expect(output).toContain('No keys removed');
  });
});
