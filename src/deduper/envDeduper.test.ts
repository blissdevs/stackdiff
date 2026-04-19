import { dedupeEnvMaps, formatDedupeReport } from './envDeduper';

const m = (obj: Record<string, string>) => new Map(Object.entries(obj));

describe('dedupeEnvMaps', () => {
  it('merges maps with no overlap', () => {
    const { deduped, duplicates } = dedupeEnvMaps([m({ A: '1' }), m({ B: '2' })]);
    expect(deduped.get('A')).toBe('1');
    expect(deduped.get('B')).toBe('2');
    expect(duplicates).toHaveLength(0);
  });

  it('uses last value by default', () => {
    const { deduped, duplicates } = dedupeEnvMaps([m({ A: 'first' }), m({ A: 'last' })]);
    expect(deduped.get('A')).toBe('last');
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].key).toBe('A');
  });

  it('uses first value with first strategy', () => {
    const { deduped } = dedupeEnvMaps([m({ A: 'first' }), m({ A: 'last' })], 'first');
    expect(deduped.get('A')).toBe('first');
  });

  it('omits key with error strategy', () => {
    const { deduped, duplicates } = dedupeEnvMaps([m({ A: '1' }), m({ A: '2' })], 'error');
    expect(deduped.has('A')).toBe(false);
    expect(duplicates).toHaveLength(1);
  });

  it('records correct sources', () => {
    const { duplicates } = dedupeEnvMaps([m({ X: 'a' }), m({ Y: 'b' }), m({ X: 'c' })]);
    expect(duplicates[0].sources).toEqual([0, 2]);
  });
});

describe('formatDedupeReport', () => {
  it('returns clean message when no duplicates', () => {
    expect(formatDedupeReport([])).toBe('No duplicate keys found.');
  });

  it('lists duplicate keys', () => {
    const report = formatDedupeReport([{ key: 'FOO', values: ['a', 'b'], sources: [0, 1] }]);
    expect(report).toContain('FOO');
    expect(report).toContain('src0=a');
    expect(report).toContain('src1=b');
  });
});
