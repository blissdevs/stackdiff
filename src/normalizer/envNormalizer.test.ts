import { normalizeKey, normalizeValue, normalizeEnvMap, formatNormalizeReport } from './envNormalizer';

const makeMap = (obj: Record<string, string>) => new Map(Object.entries(obj));

describe('normalizeKey', () => {
  it('trims whitespace from keys', () => {
    expect(normalizeKey('  KEY  ')).toBe('KEY');
  });

  it('uppercases keys when option is set', () => {
    expect(normalizeKey('my_key', { uppercaseKeys: true })).toBe('MY_KEY');
  });

  it('leaves key as-is by default', () => {
    expect(normalizeKey('My_Key')).toBe('My_Key');
  });
});

describe('normalizeValue', () => {
  it('trims values by default', () => {
    expect(normalizeValue('  hello  ')).toBe('hello');
  });

  it('collapses whitespace when option is set', () => {
    expect(normalizeValue('hello   world', { collapseWhitespace: true })).toBe('hello world');
  });

  it('does not trim when trimValues is false', () => {
    expect(normalizeValue('  hi  ', { trimValues: false })).toBe('  hi  ');
  });
});

describe('normalizeEnvMap', () => {
  it('trims all values by default', () => {
    const env = makeMap({ KEY: '  value  ', OTHER: ' test ' });
    const result = normalizeEnvMap(env);
    expect(result.get('KEY')).toBe('value');
    expect(result.get('OTHER')).toBe('test');
  });

  it('uppercases keys when option is set', () => {
    const env = makeMap({ my_key: 'val' });
    const result = normalizeEnvMap(env, { uppercaseKeys: true });
    expect(result.has('MY_KEY')).toBe(true);
    expect(result.has('my_key')).toBe(false);
  });

  it('removes empty values when option is set', () => {
    const env = makeMap({ KEY: 'value', EMPTY: '  ' });
    const result = normalizeEnvMap(env, { removeEmptyValues: true });
    expect(result.has('EMPTY')).toBe(false);
    expect(result.has('KEY')).toBe(true);
  });

  it('preserves all entries when removeEmptyValues is false', () => {
    const env = makeMap({ KEY: 'value', EMPTY: '' });
    const result = normalizeEnvMap(env);
    expect(result.size).toBe(2);
  });
});

describe('formatNormalizeReport', () => {
  it('returns a string report', () => {
    const original = makeMap({ KEY: '  value  ' });
    const normalized = normalizeEnvMap(original);
    const report = formatNormalizeReport(original, normalized);
    expect(typeof report).toBe('string');
    expect(report).toContain('Normalization Report');
  });
});
