import { sortEnvMap, groupEnvByPrefix, applySortOptions } from './envSorter';
import { EnvMap } from '../parser/envParser';

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe('sortEnvMap', () => {
  it('sorts keys ascending by default', () => {
    const map = makeMap({ ZEBRA: '1', APPLE: '2', MANGO: '3' });
    const sorted = sortEnvMap(map);
    expect([...sorted.keys()]).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  it('sorts keys descending when specified', () => {
    const map = makeMap({ ZEBRA: '1', APPLE: '2', MANGO: '3' });
    const sorted = sortEnvMap(map, 'desc');
    expect([...sorted.keys()]).toEqual(['ZEBRA', 'MANGO', 'APPLE']);
  });

  it('preserves values after sort', () => {
    const map = makeMap({ B: 'beta', A: 'alpha' });
    const sorted = sortEnvMap(map);
    expect(sorted.get('A')).toBe('alpha');
    expect(sorted.get('B')).toBe('beta');
  });
});

describe('groupEnvByPrefix', () => {
  it('groups keys by underscore prefix', () => {
    const map = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'test' });
    const groups = groupEnvByPrefix(map);
    expect(Object.keys(groups).sort()).toEqual(['APP', 'DB']);
    expect([...groups['DB'].keys()].sort()).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('places keys without delimiter into __ungrouped__', () => {
    const map = makeMap({ NOPREFIX: 'value', APP_KEY: 'k' });
    const groups = groupEnvByPrefix(map);
    expect(groups['__ungrouped__']).toBeDefined();
    expect(groups['__ungrouped__'].get('NOPREFIX')).toBe('value');
  });

  it('supports custom delimiter', () => {
    const map = makeMap({ 'APP.NAME': 'test', 'APP.PORT': '3000' });
    const groups = groupEnvByPrefix(map, '.');
    expect(groups['APP']).toBeDefined();
    expect(groups['APP'].size).toBe(2);
  });
});

describe('applySortOptions', () => {
  it('applies flat sort when groupByPrefix is false', () => {
    const map = makeMap({ Z: '1', A: '2' });
    const result = applySortOptions(map, { order: 'asc' });
    expect([...result.keys()]).toEqual(['A', 'Z']);
  });

  it('groups and sorts when groupByPrefix is true', () => {
    const map = makeMap({ DB_HOST: 'h', APP_NAME: 'n', DB_PORT: 'p' });
    const result = applySortOptions(map, { groupByPrefix: true, order: 'asc' });
    const keys = [...result.keys()];
    expect(keys.indexOf('APP_NAME')).toBeLessThan(keys.indexOf('DB_HOST'));
    expect(keys.indexOf('DB_HOST')).toBeLessThan(keys.indexOf('DB_PORT'));
  });
});
