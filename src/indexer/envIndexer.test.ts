import {
  buildEnvIndex,
  lookupKey,
  lookupValue,
  formatIndexReport,
} from './envIndexer';

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

describe('buildEnvIndex', () => {
  const maps = {
    prod: makeMap({ API_URL: 'https://prod.example.com', DB_HOST: 'prod-db', SECRET: 'abc' }),
    staging: makeMap({ API_URL: 'https://staging.example.com', DB_HOST: 'staging-db', DEBUG: 'true' }),
    dev: makeMap({ API_URL: 'https://dev.example.com', DEBUG: 'true', SECRET: 'abc' }),
  };

  let index: ReturnType<typeof buildEnvIndex>;

  beforeEach(() => {
    index = buildEnvIndex(maps);
  });

  it('indexes keys across all sources', () => {
    expect(index.byKey.get('API_URL')).toEqual(['prod', 'staging', 'dev']);
    expect(index.byKey.get('DB_HOST')).toEqual(['prod', 'staging']);
    expect(index.byKey.get('SECRET')).toEqual(['prod', 'dev']);
    expect(index.byKey.get('DEBUG')).toEqual(['staging', 'dev']);
  });

  it('indexes values to keys', () => {
    const trueKeys = index.byValue.get('true');
    expect(trueKeys).toContain('DEBUG');

    const abcKeys = index.byValue.get('abc');
    expect(abcKeys).toContain('SECRET');
  });

  it('indexes sources to their keys', () => {
    expect(index.bySource.get('prod')).toEqual(['API_URL', 'DB_HOST', 'SECRET']);
    expect(index.bySource.get('dev')).toEqual(['API_URL', 'DEBUG', 'SECRET']);
  });
});

describe('lookupKey', () => {
  it('returns sources for a known key', () => {
    const maps = { a: new Map([['FOO', 'bar']]), b: new Map([['FOO', 'baz']]) };
    const index = buildEnvIndex(maps);
    expect(lookupKey(index, 'FOO')).toEqual(['a', 'b']);
  });

  it('returns empty array for unknown key', () => {
    const index = buildEnvIndex({ a: new Map() });
    expect(lookupKey(index, 'MISSING')).toEqual([]);
  });
});

describe('lookupValue', () => {
  it('returns keys sharing a value', () => {
    const maps = { a: new Map([['X', 'same'], ['Y', 'same']]) };
    const index = buildEnvIndex(maps);
    expect(lookupValue(index, 'same')).toContain('X');
    expect(lookupValue(index, 'same')).toContain('Y');
  });
});

describe('formatIndexReport', () => {
  it('produces a non-empty report string', () => {
    const maps = { env1: new Map([['KEY', 'val']]) };
    const index = buildEnvIndex(maps);
    const report = formatIndexReport(index);
    expect(report).toContain('Env Index Report');
    expect(report).toContain('KEY');
    expect(report).toContain('env1');
  });
});
