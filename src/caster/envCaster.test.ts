import { castValue, castEnvMap, formatCastReport, CastRule } from './envCaster';

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

describe('castValue', () => {
  it('casts to number', () => {
    expect(castValue('42', 'number')).toEqual({ casted: 42 });
    expect(castValue('3.14', 'number')).toEqual({ casted: 3.14 });
  });

  it('returns error for invalid number', () => {
    const result = castValue('abc', 'number');
    expect(result.casted).toBeUndefined();
    expect(result.error).toMatch(/Cannot cast/);
  });

  it('casts truthy booleans', () => {
    expect(castValue('true', 'boolean')).toEqual({ casted: true });
    expect(castValue('1', 'boolean')).toEqual({ casted: true });
    expect(castValue('yes', 'boolean')).toEqual({ casted: true });
  });

  it('casts falsy booleans', () => {
    expect(castValue('false', 'boolean')).toEqual({ casted: false });
    expect(castValue('0', 'boolean')).toEqual({ casted: false });
    expect(castValue('no', 'boolean')).toEqual({ casted: false });
  });

  it('returns error for invalid boolean', () => {
    const result = castValue('maybe', 'boolean');
    expect(result.error).toBeDefined();
  });

  it('casts to json', () => {
    expect(castValue('{"a":1}', 'json')).toEqual({ casted: { a: 1 } });
  });

  it('returns error for invalid json', () => {
    const result = castValue('{bad}', 'json');
    expect(result.error).toBeDefined();
  });

  it('casts to array', () => {
    expect(castValue('a,b,c', 'array')).toEqual({ casted: ['a', 'b', 'c'] });
    expect(castValue('x , y', 'array')).toEqual({ casted: ['x', 'y'] });
  });

  it('casts to string (default)', () => {
    expect(castValue('hello', 'string')).toEqual({ casted: 'hello' });
  });
});

describe('castEnvMap', () => {
  it('applies rules to matching keys', () => {
    const env = makeMap({ PORT: '8080', DEBUG: 'true', NAME: 'app' });
    const rules: CastRule[] = [
      { key: 'PORT', type: 'number' },
      { key: 'DEBUG', type: 'boolean' },
    ];
    const report = castEnvMap(env, rules);
    expect(report.successCount).toBe(3);
    expect(report.failureCount).toBe(0);
    const portResult = report.results.find((r) => r.key === 'PORT');
    expect(portResult?.casted).toBe(8080);
    const debugResult = report.results.find((r) => r.key === 'DEBUG');
    expect(debugResult?.casted).toBe(true);
  });

  it('defaults unmatched keys to string type', () => {
    const env = makeMap({ UNTYPED: 'value' });
    const report = castEnvMap(env, []);
    expect(report.results[0].type).toBe('string');
    expect(report.results[0].casted).toBe('value');
  });

  it('records failures', () => {
    const env = makeMap({ PORT: 'not-a-number' });
    const rules: CastRule[] = [{ key: 'PORT', type: 'number' }];
    const report = castEnvMap(env, rules);
    expect(report.failureCount).toBe(1);
    expect(report.results[0].success).toBe(false);
  });
});

describe('formatCastReport', () => {
  it('includes summary line', () => {
    const env = makeMap({ X: '1' });
    const report = castEnvMap(env, [{ key: 'X', type: 'number' }]);
    const output = formatCastReport(report);
    expect(output).toMatch(/Cast Report/);
    expect(output).toMatch(/1 ok/);
    expect(output).toMatch(/✓/);
  });

  it('marks failures with ✗', () => {
    const env = makeMap({ X: 'bad' });
    const report = castEnvMap(env, [{ key: 'X', type: 'number' }]);
    const output = formatCastReport(report);
    expect(output).toMatch(/✗/);
  });
});
