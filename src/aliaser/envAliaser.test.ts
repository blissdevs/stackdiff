import {
  applyAliases,
  resolveAlias,
  buildAliasMap,
  formatAliasReport,
} from './envAliaser';

const makeMap = (obj: Record<string, string>) => new Map(Object.entries(obj));

describe('buildAliasMap', () => {
  it('parses alias=canonical entries', () => {
    const map = buildAliasMap(['APP_KEY=APP_SECRET', 'DB=DATABASE_URL']);
    expect(map).toEqual({ APP_KEY: 'APP_SECRET', DB: 'DATABASE_URL' });
  });

  it('skips malformed entries', () => {
    const map = buildAliasMap(['NOEQUALS', 'A=B']);
    expect(map).toEqual({ A: 'B' });
  });
});

describe('applyAliases', () => {
  it('copies canonical value to alias key', () => {
    const env = makeMap({ APP_SECRET: 'mysecret' });
    const result = applyAliases(env, { APP_KEY: 'APP_SECRET' });
    expect(result.get('APP_KEY')).toBe('mysecret');
    expect(result.get('APP_SECRET')).toBe('mysecret');
  });

  it('skips alias if canonical is missing', () => {
    const env = makeMap({ OTHER: 'val' });
    const result = applyAliases(env, { APP_KEY: 'APP_SECRET' });
    expect(result.has('APP_KEY')).toBe(false);
  });

  it('does not mutate original map', () => {
    const env = makeMap({ X: '1' });
    applyAliases(env, { Y: 'X' });
    expect(env.has('Y')).toBe(false);
  });
});

describe('resolveAlias', () => {
  it('returns canonical for known alias', () => {
    expect(resolveAlias('DB', { DB: 'DATABASE_URL' })).toBe('DATABASE_URL');
  });

  it('returns key itself if not an alias', () => {
    expect(resolveAlias('UNKNOWN', {})).toBe('UNKNOWN');
  });
});

describe('formatAliasReport', () => {
  it('includes alias, canonical and value', () => {
    const env = makeMap({ DATABASE_URL: 'postgres://localhost' });
    const report = formatAliasReport(env, { DB: 'DATABASE_URL' });
    expect(report).toContain('DB -> DATABASE_URL');
    expect(report).toContain('postgres://localhost');
  });

  it('shows missing for absent canonical', () => {
    const env = makeMap({});
    const report = formatAliasReport(env, { DB: 'DATABASE_URL' });
    expect(report).toContain('<missing>');
  });
});
