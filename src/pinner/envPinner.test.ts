import { pinKeys, checkPinViolations, formatPinReport, pinMapToJson } from './envPinner';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('pinKeys', () => {
  it('pins existing keys', () => {
    const env = makeMap({ FOO: 'bar', BAZ: 'qux' });
    const pins = pinKeys(env, ['FOO']);
    expect(pins.has('FOO')).toBe(true);
    expect(pins.get('FOO')!.value).toBe('bar');
  });

  it('ignores missing keys', () => {
    const env = makeMap({ FOO: 'bar' });
    const pins = pinKeys(env, ['MISSING']);
    expect(pins.size).toBe(0);
  });
});

describe('checkPinViolations', () => {
  it('returns empty when all match', () => {
    const env = makeMap({ FOO: 'bar' });
    const pins = pinKeys(env, ['FOO']);
    expect(checkPinViolations(env, pins)).toHaveLength(0);
  });

  it('detects changed value', () => {
    const env = makeMap({ FOO: 'bar' });
    const pins = pinKeys(env, ['FOO']);
    const updated = makeMap({ FOO: 'changed' });
    const violations = checkPinViolations(updated, pins);
    expect(violations).toHaveLength(1);
    expect(violations[0].key).toBe('FOO');
    expect(violations[0].actual).toBe('changed');
  });

  it('detects missing key', () => {
    const env = makeMap({ FOO: 'bar' });
    const pins = pinKeys(env, ['FOO']);
    const violations = checkPinViolations(new Map(), pins);
    expect(violations[0].actual).toBeUndefined();
  });
});

describe('formatPinReport', () => {
  it('reports no violations', () => {
    const env = makeMap({ FOO: 'bar' });
    const pins = pinKeys(env, ['FOO']);
    const report = formatPinReport(pins, []);
    expect(report).toContain('No violations');
  });

  it('reports violations', () => {
    const env = makeMap({ FOO: 'bar' });
    const pins = pinKeys(env, ['FOO']);
    const violations = [{ key: 'FOO', expected: 'bar', actual: 'oops' }];
    const report = formatPinReport(pins, violations);
    expect(report).toContain('VIOLATION');
  });
});

describe('pinMapToJson', () => {
  it('serializes pin map', () => {
    const env = makeMap({ FOO: 'bar' });
    const pins = pinKeys(env, ['FOO']);
    const json = pinMapToJson(pins) as Record<string, unknown>;
    expect(json['FOO']).toBeDefined();
  });
});
