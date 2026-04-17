import { sortEnvMap, groupEnvByPrefix, applySortOptions } from './envSorter';

const sampleMap: Record<string, string> = {
  ZEBRA: 'z',
  APPLE: 'a',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'myapp',
  APP_ENV: 'production',
};

describe('sortEnvMap', () => {
  it('sorts keys alphabetically ascending', () => {
    const result = sortEnvMap(sampleMap, 'asc');
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort());
  });

  it('sorts keys alphabetically descending', () => {
    const result = sortEnvMap(sampleMap, 'desc');
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort().
  it('preserves values after sorting', () => {
    const result = sortEnvMap(sampleMap, 'asc');
    expect(result['APPLE']).toBe('a');
    expect(result['z');
  });
});

describe('groupEnvByPrefix', () => {
  it('groups keys by prefix separated by underscore', () => {
    const result = groupEnvByPrefix(sampleMap);
    expect(result['DB']).toBeDefined();
    expect(result['DB']['DB_HOST']).toBe('localhost');
    expect(result['DB']['DB_PORT']).toBe('5432');
    expect(result['APP']).toBeDefined();
    expect(result['APP']['APP_NAME']).toBe('myapp');
  });

  it('places keys without underscore under empty string group', () => {
    const result = groupEnvByPrefix({ SIMPLE: 'value' });
    expect(result['']).toBeDefined();
    expect(result['']['SIMPLE']).toBe('value');
  });
});

describe('applySortOptions', () => {
  it('applies ascending sort when option is asc', () => {
    const result = applySortOptions(sampleMap, { order: 'asc', groupByPrefix: false });
    const keys = Object.keys(result as Record<string, string>);
    expect(keys).toEqual([...keys].sort());
  });

  it('returns grouped result when groupByPrefix is true', () => {
    const result = applySortOptions(sampleMap, { order: 'asc', groupByPrefix: true }) as Record<string, Record<string, string>>;
    expect(result['DB']).toBeDefined();
    expect(result['APP']).toBeDefined();
  });
});
