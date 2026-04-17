import { sortEnvMap, groupEnvByPrefix, applySortOptions } from './envSorter';

const sampleEnv: Record<string, string> = {
  DB_HOST: 'localhost',
  APP_PORT: '3000',
  DB_PORT: '5432',
  APP_NAME: 'stackdiff',
  REDIS_URL: 'redis://localhost',
};

describe('sortEnvMap', () => {
  it('sorts keys ascending by default', () => {
    const result = sortEnvMap(sampleEnv);
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort());
  });

  it('sorts keys descending', () => {
    const result = sortEnvMap(sampleEnv, 'desc');
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort((a, b) => b.localeCompare(a)));
  });

  it('returns original order when order is none', () => {
    const result = sortEnvMap(sampleEnv, 'none');
    expect(Object.keys(result)).toEqual(Object.keys(sampleEnv));
  });
});

describe('groupEnvByPrefix', () => {
  it('groups keys by prefix', () => {
    const result = groupEnvByPrefix(sampleEnv);
    expect(result).toHaveProperty('DB');
    expect(result).toHaveProperty('APP');
    expect(result).toHaveProperty('REDIS');
    expect(result['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('places keys without delimiter into __other__', () => {
    const env = { SIMPLE: 'value', APP_KEY: 'abc' };
    const result = groupEnvByPrefix(env);
    expect(result['__other__']).toEqual({ SIMPLE: 'value' });
  });

  it('respects custom delimiter', () => {
    const env = { 'APP.NAME': 'test', 'APP.PORT': '80' };
    const result = groupEnvByPrefix(env, '.');
    expect(result).toHaveProperty('APP');
  });
});

describe('applySortOptions', () => {
  it('returns sorted flat map when groupByPrefix is false', () => {
    const result = applySortOptions(sampleEnv, { order: 'asc' });
    expect(Array.isArray(result)).toBe(false);
    const keys = Object.keys(result as Record<string, string>);
    expect(keys).toEqual([...keys].sort());
  });

  it('returns grouped map when groupByPrefix is true', () => {
    const result = applySortOptions(sampleEnv, { groupByPrefix: true }) as Record<string, Record<string, string>>;
    expect(result).toHaveProperty('DB');
    expect(result).toHaveProperty('APP');
  });
});
