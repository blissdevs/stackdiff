import { sortEnvMap, groupEnvByPrefix, applySortOptions } from './envSorter';
import { EnvMap } from '../parser/envParser';

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe('sortEnvMap', () => {
  it('sorts keys ascending by default', () => {
    const map = makeMap({ ZEBRA: '1', APPLE: '2', MANGO: '3' });
    const sorted = sortEnvMap(map);
    expect(Array.from(sorted.keys())).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  it('sorts keys descending', () => {
    const map = makeMap({ ZEBRA: '1', APPLE: '2', MANGO: '3' });
    const sorted = sortEnvMap(map, 'desc');
    expect(Array.from(sorted.keys())).toEqual(['ZEBRA', 'MANGO', 'APPLE']);
  });

  it('preserves values after sorting', () => {
    const map = makeMap({ B: 'beta', A: 'alpha' });
    const sorted = sortEnvMap(map);
    expect(sorted.get('A')).toBe('alpha');
    expect(sorted.get('B')).toBe('beta');
  });

  it('handles empty map', () => {
    expect(sortEnvMap(new Map())).toEqual(new Map());
  });
});

describe('groupEnvByPrefix', () => {
  it('groups keys by prefix using delimiter', () => {
    const map = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'test' });
    const groups = groupEnvByPrefix(map, '_');
    expect(groups.has('DB')).toBe(true);
    expect(groups.has('APP')).toBe(true);
    expect(groups.get('DB')!.has('DB_HOST')).toBe(true);
    expect(groups.get('DB')!.has('DB_PORT')).toBe(true);
  });

  it('places keys without delimiter into __ungrouped__', () => {
    const map = makeMap({ NOPREFIX: 'val', APP_KEY: 'other' });
    const groups = groupEnvByPrefix(map);
    expect(groups.has('__ungrouped__')).toBe(true);
    expect(groups.get('__ungrouped__')!.has('NOPREFIX')).toBe(true);
  });
});

describe('applySortOptions', () => {
  it('applies flat sort when groupByPrefix is false', () => {
    const map = makeMap({ Z: '1', A: '2', M: '3' });
    const result = applySortOptions(map, { order: 'asc', groupByPrefix: false });
    expect(Array.from(result.keys())).toEqual(['A', 'M', 'Z']);
  });

  it('groups and sorts when groupByPrefix is true', () => {
    const map = makeMap({ DB_PORT: '5432', APP_NAME: 'test', DB_HOST: 'localhost' });
    const result = applySortOptions(map, { order: 'asc', groupByPrefix: true });
    const keys = Array.from(result.keys());
    expect(keys.indexOf('APP_NAME')).toBeLessThan(keys.indexOf('DB_HOST'));
    expect(keys.indexOf('DB_HOST')).toBeLessThan(keys.indexOf('DB_PORT'));
  });

  it('defaults to ascending order with no options', () => {
    const map = makeMap({ C: '3', A: '1', B: '2' });
    const result = applySortOptions(map);
    expect(Array.from(result.keys())).toEqual(['A', 'B', 'C']);
  });
});
