import { weightKey, weighEnvMap, formatWeightReport, weightResultToJson } from './envWeigher';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('weightKey', () => {
  it('returns a positive weight for a normal key', () => {
    const entry = weightKey('DATABASE_URL', 'postgres://localhost/db');
    expect(entry.weight).toBeGreaterThan(0);
    expect(entry.key).toBe('DATABASE_URL');
  });

  it('adds sensitive bonus for secret-like keys', () => {
    const plain = weightKey('APP_NAME', 'myapp');
    const secret = weightKey('API_SECRET', 'myapp');
    expect(secret.weight).toBeGreaterThan(plain.weight);
  });

  it('adds depth bonus for deeply prefixed keys', () => {
    const shallow = weightKey('FOO', 'val');
    const deep = weightKey('FOO_BAR_BAZ_QUX', 'val');
    expect(deep.weight).toBeGreaterThan(shallow.weight);
  });

  it('respects custom factors', () => {
    const entry = weightKey('KEY', 'value', { keyLengthFactor: 0, valueLengthFactor: 0, sensitiveBonus: 0, prefixDepthFactor: 0 });
    expect(entry.weight).toBe(0);
  });
});

describe('weighEnvMap', () => {
  it('returns sorted entries heaviest first', () => {
    const env = makeMap({ A: 'x', DATABASE_PASSWORD: 'supersecret123456' });
    const result = weighEnvMap(env);
    expect(result.entries[0].key).toBe('DATABASE_PASSWORD');
  });

  it('identifies heaviest and lightest keys', () => {
    const env = makeMap({ SHORT: 'a', VERY_LONG_SECRET_TOKEN_KEY: 'longvalue' });
    const result = weighEnvMap(env);
    expect(result.heaviestKey).toBe('VERY_LONG_SECRET_TOKEN_KEY');
    expect(result.lightestKey).toBe('SHORT');
  });

  it('handles empty map', () => {
    const result = weighEnvMap(new Map());
    expect(result.entries).toHaveLength(0);
    expect(result.totalWeight).toBe(0);
    expect(result.heaviestKey).toBeNull();
    expect(result.lightestKey).toBeNull();
  });

  it('sums total weight correctly', () => {
    const env = makeMap({ FOO: 'bar', BAZ: 'qux' });
    const result = weighEnvMap(env);
    const manual = result.entries.reduce((s, e) => s + e.weight, 0);
    expect(result.totalWeight).toBe(manual);
  });
});

describe('formatWeightReport', () => {
  it('includes header and key names', () => {
    const env = makeMap({ MY_KEY: 'value' });
    const result = weighEnvMap(env);
    const report = formatWeightReport(result);
    expect(report).toContain('ENV WEIGHT REPORT');
    expect(report).toContain('MY_KEY');
    expect(report).toContain('Total weight');
  });
});

describe('weightResultToJson', () => {
  it('produces valid JSON', () => {
    const env = makeMap({ TOKEN: 'abc' });
    const result = weighEnvMap(env);
    const json = weightResultToJson(result);
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty('entries');
    expect(parsed).toHaveProperty('totalWeight');
  });
});
