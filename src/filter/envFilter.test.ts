import { filterEnvMap, searchEnvMap, EnvMap } from './envFilter';

const sample: EnvMap = {
  APP_NAME: 'myapp',
  APP_PORT: '3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
  DEBUG: 'true',
};

describe('filterEnvMap', () => {
  it('returns all keys when no options given', () => {
    expect(filterEnvMap(sample, {})).toEqual(sample);
  });

  it('filters by explicit keys', () => {
    const result = filterEnvMap(sample, { keys: ['APP_NAME', 'DEBUG'] });
    expect(result).toEqual({ APP_NAME: 'myapp', DEBUG: 'true' });
  });

  it('filters by pattern', () => {
    const result = filterEnvMap(sample, { pattern: '^DB_' });
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('excludes by key list', () => {
    const result = filterEnvMap(sample, { excludeKeys: ['SECRET_KEY', 'DEBUG'] });
    expect(result).not.toHaveProperty('SECRET_KEY');
    expect(result).not.toHaveProperty('DEBUG');
    expect(Object.keys(result)).toHaveLength(4);
  });

  it('excludes by pattern', () => {
    const result = filterEnvMap(sample, { excludePattern: '^APP_' });
    expect(result).not.toHaveProperty('APP_NAME');
    expect(result).not.toHaveProperty('APP_PORT');
  });

  it('combines include pattern and exclude keys', () => {
    const result = filterEnvMap(sample, { pattern: '^DB_', excludeKeys: ['DB_PORT'] });
    expect(result).toEqual({ DB_HOST: 'localhost' });
  });

  it('returns empty map when no keys match', () => {
    const result = filterEnvMap(sample, { keys: ['NONEXISTENT'] });
    expect(result).toEqual({});
  });
});

describe('searchEnvMap', () => {
  it('finds keys containing query (case-insensitive)', () => {
    const result = searchEnvMap(sample, 'app');
    expect(Object.keys(result)).toEqual(['APP_NAME', 'APP_PORT']);
  });

  it('returns empty map when nothing matches', () => {
    expect(searchEnvMap(sample, 'xyz')).toEqual({});
  });

  it('matches partial key names', () => {
    const result = searchEnvMap(sample, 'port');
    expect(result).toHaveProperty('APP_PORT');
    expect(result).toHaveProperty('DB_PORT');
  });
});
