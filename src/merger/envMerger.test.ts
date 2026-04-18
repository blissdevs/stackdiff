import { mergeEnvMaps, formatMergeConflicts, MergeResult } from './envMerger';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('mergeEnvMaps', () => {
  it('merges non-overlapping maps', () => {
    const a = makeMap({ A: '1', B: '2' });
    const b = makeMap({ C: '3' });
    const { merged, conflicts } = mergeEnvMaps([a, b]);
    expect(merged.get('A')).toBe('1');
    expect(merged.get('C')).toBe('3');
    expect(conflicts).toHaveLength(0);
  });

  it('last-wins strategy overwrites on conflict', () => {
    const a = makeMap({ KEY: 'old' });
    const b = makeMap({ KEY: 'new' });
    const { merged, conflicts } = mergeEnvMaps([a, b], { strategy: 'last-wins' });
    expect(merged.get('KEY')).toBe('new');
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].values).toEqual(['old', 'new']);
  });

  it('first-wins strategy keeps original on conflict', () => {
    const a = makeMap({ KEY: 'original' });
    const b = makeMap({ KEY: 'override' });
    const { merged } = mergeEnvMaps([a, b], { strategy: 'first-wins' });
    expect(merged.get('KEY')).toBe('original');
  });

  it('error-on-conflict throws on duplicate key', () => {
    const a = makeMap({ KEY: 'a' });
    const b = makeMap({ KEY: 'b' });
    expect(() => mergeEnvMaps([a, b], { strategy: 'error-on-conflict' })).toThrow(
      'Merge conflict on key: KEY'
    );
  });

  it('no conflict when same key has same value', () => {
    const a = makeMap({ KEY: 'same' });
    const b = makeMap({ KEY: 'same' });
    const { conflicts } = mergeEnvMaps([a, b]);
    expect(conflicts).toHaveLength(0);
  });

  it('merges three maps with last-wins', () => {
    const a = makeMap({ X: '1' });
    const b = makeMap({ X: '2' });
    const c = makeMap({ X: '3' });
    const { merged } = mergeEnvMaps([a, b, c]);
    expect(merged.get('X')).toBe('3');
  });
});

describe('formatMergeConflicts', () => {
  it('returns no conflicts message when empty', () => {
    expect(formatMergeConflicts([])).toBe('No conflicts.');
  });

  it('formats conflicts list', () => {
    const result = formatMergeConflicts([{ key: 'FOO', values: ['a', 'b'] }]);
    expect(result).toContain('FOO');
    expect(result).toContain('"a"');
    expect(result).toContain('"b"');
  });
});
