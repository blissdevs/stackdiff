import { extractEnvMap, formatExtractReport, extractResultToJson } from './envExtractor';
import { EnvMap } from '../parser/envParser';

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe('extractEnvMap', () => {
  const env = makeMap({
    APP_HOST: 'localhost',
    APP_PORT: '3000',
    DB_HOST: 'db.local',
    DB_PORT: '5432',
    SECRET_KEY: 'abc123',
  });

  it('extracts by explicit key list', () => {
    const result = extractEnvMap(env, { keys: ['APP_HOST', 'SECRET_KEY'] });
    expect(result.extracted.size).toBe(2);
    expect(result.extracted.get('APP_HOST')).toBe('localhost');
    expect(result.extracted.get('SECRET_KEY')).toBe('abc123');
    expect(result.skipped).toContain('DB_HOST');
  });

  it('extracts by prefix', () => {
    const result = extractEnvMap(env, { prefix: 'APP_' });
    expect(result.extracted.size).toBe(2);
    expect([...result.extracted.keys()]).toContain('APP_HOST');
    expect([...result.extracted.keys()]).toContain('APP_PORT');
  });

  it('strips prefix when stripPrefix is true', () => {
    const result = extractEnvMap(env, { prefix: 'DB_', stripPrefix: true });
    expect(result.extracted.has('HOST')).toBe(true);
    expect(result.extracted.has('PORT')).toBe(true);
    expect(result.extracted.has('DB_HOST')).toBe(false);
  });

  it('extracts by pattern', () => {
    const result = extractEnvMap(env, { pattern: /^(APP|DB)_PORT$/ });
    expect(result.extracted.size).toBe(2);
    expect(result.extracted.get('APP_PORT')).toBe('3000');
    expect(result.extracted.get('DB_PORT')).toBe('5432');
  });

  it('extracts all keys when no filter provided', () => {
    const result = extractEnvMap(env, {});
    expect(result.extracted.size).toBe(env.size);
    expect(result.skipped.length).toBe(0);
  });

  it('returns correct totalInput', () => {
    const result = extractEnvMap(env, { keys: ['APP_HOST'] });
    expect(result.totalInput).toBe(5);
  });
});

describe('formatExtractReport', () => {
  it('returns a human-readable report string', () => {
    const env = makeMap({ FOO: 'bar', BAZ: 'qux' });
    const result = extractEnvMap(env, { keys: ['FOO'] });
    const report = formatExtractReport(result);
    expect(report).toContain('Extract Report');
    expect(report).toContain('Extracted   : 1');
    expect(report).toContain('Skipped     : 1');
    expect(report).toContain('FOO');
  });
});

describe('extractResultToJson', () => {
  it('serializes result to plain object', () => {
    const env = makeMap({ A: '1', B: '2' });
    const result = extractEnvMap(env, { keys: ['A'] });
    const json = extractResultToJson(result) as any;
    expect(json.extractedCount).toBe(1);
    expect(json.skippedCount).toBe(1);
    expect(json.extracted).toEqual({ A: '1' });
    expect(json.skipped).toEqual(['B']);
  });
});
