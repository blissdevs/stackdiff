import { sortEnvMap, groupEnvByPrefix, applySortOptions } from './envSorter';
import { EnvMap } from '../parser/envParser';

function makeMap(entries: [string, string][]): EnvMap {
  return new Map(entries);
}

describe('sortEnvMap', () => {
  it('sorts keys ascending by default', () => {
    const map = makeMap([['ZEBRA', '1'], ['ALPHA', '2'], ['MANGO', '3']]);
    const result = sortEnvMap(map);
    expect(Array.from(result.keys())).toEqual(['ALPHA', 'MANGO', 'ZEBRA']);
  });

  it('sorts keys descending', () => {
    const map = makeMap([['ZEBRA', '1'], ['ALPHA', '2'], ['MANGO', '3']]);
    const result = sortEnvMap(map, 'desc');
    expect(Array.from(result.keys())).toEqual(['ZEBRA', 'MANGO', 'ALPHA']);
  });

  it('returns empty map for empty input', () => {
    expect(sortEnvMap(new Map()).size).toBe(0);
  });
});

describe('groupEnvByPrefix', () => {
  it('groups keys by underscore prefix', () => {
    const map = makeMap([
      ['DB_HOST', 'localhost'],
      ['DB_PORT', '5432'],
      ['APP_NAME', 'myapp'],
    ]);
    const groups = groupEnvByPrefix(map);
    expect(groups.has('DB')).toBe(true);
    expect(groups.has('APP')).toBe(true);
    expect(groups.get('DB')!.size).toBe(2);
    expect(groups.get('APP')!.size).toBe(1);
  });

  it('places unprefixed keys in __other__', () => {
    const map = makeMap([['NOPREFIX', 'val']]);
    const groups = groupEnvByPrefix(map);
    expect(groups.has('__other__')).toBe(true);
  });

  it('respects custom delimiter', () => {
    const map = makeMap([['DB.HOST', 'localhost'], ['DB.PORT', '5432']]);
    const groups = groupEnvByPrefix(map, '.');
    expect(groups.has('DB')).toBe(true);
    expect(groups.get('DB')!.size).toBe(2);
  });
});

describe('applySortOptions', () => {
  it('sorts without grouping', () => {
    const map = makeMap([['Z_KEY', '1'], ['A_KEY', '2']]);
    const result = applySortOptions(map, { order: 'asc' });
    expect(Array.from(result.keys())).toEqual(['A_KEY', 'Z_KEY']);
  });

  it('sorts with grouping preserves prefix order', () => {
    const map = makeMap([
      ['Z_B', '1'], ['Z_A', '2'], ['A_C', '3']
    ]);
    const result = applySortOptions(map, { order: 'asc', groupByPrefix: true });
    const keys = Array.from(result.keys());
    expect(keys.indexOf('A_C')).toBeLessThan(keys.indexOf('Z_A'));
    expect(keys.indexOf('Z_A')).toBeLessThan(keys.indexOf('Z_B'));
  });
});
