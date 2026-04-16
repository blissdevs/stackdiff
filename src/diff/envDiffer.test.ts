import { diffEnvMaps, hasDiff } from './envDiffer';

describe('diffEnvMaps', () => {
  it('returns empty diff for identical maps', () => {
    const env = { FOO: 'bar', BAZ: '123' };
    const result = diffEnvMaps(env, { ...env });
    expect(result.onlyInA).toEqual([]);
    expect(result.onlyInB).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toEqual(expect.arrayContaining(['FOO', 'BAZ']));
  });

  it('detects keys only in A', () => {
    const result = diffEnvMaps({ FOO: 'bar', EXTRA: 'x' }, { FOO: 'bar' });
    expect(result.onlyInA).toContain('EXTRA');
    expect(result.onlyInB).toEqual([]);
  });

  it('detects keys only in B', () => {
    const result = diffEnvMaps({ FOO: 'bar' }, { FOO: 'bar', NEW_KEY: 'val' });
    expect(result.onlyInB).toContain('NEW_KEY');
    expect(result.onlyInA).toEqual([]);
  });

  it('detects changed values', () => {
    const result = diffEnvMaps({ DB_URL: 'localhost' }, { DB_URL: 'prod-host' });
    expect(result.changed).toEqual([
      { key: 'DB_URL', valueA: 'localhost', valueB: 'prod-host' },
    ]);
  });

  it('handles completely disjoint maps', () => {
    const result = diffEnvMaps({ A: '1' }, { B: '2' });
    expect(result.onlyInA).toEqual(['A']);
    expect(result.onlyInB).toEqual(['B']);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });
});

describe('hasDiff', () => {
  it('returns false for identical maps', () => {
    const result = diffEnvMaps({ X: '1' }, { X: '1' });
    expect(hasDiff(result)).toBe(false);
  });

  it('returns true when there are differences', () => {
    const result = diffEnvMaps({ X: '1' }, { X: '2' });
    expect(hasDiff(result)).toBe(true);
  });
});
