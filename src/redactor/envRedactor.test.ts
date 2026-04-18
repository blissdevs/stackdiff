import { redactEnvMap, shouldRedact, getRedactedKeys, redactValue } from './envRedactor';

type EnvMap = Map<string, string>;
const makeMap = (obj: Record<string, string>): EnvMap => new Map(Object.entries(obj));

describe('shouldRedact', () => {
  it('returns true for keys matching default patterns', () => {
    expect(shouldRedact('API_KEY')).toBe(true);
    expect(shouldRedact('DB_PASSWORD')).toBe(true);
    expect(shouldRedact('AUTH_TOKEN')).toBe(true);
    expect(shouldRedact('PRIVATE_KEY')).toBe(true);
  });

  it('returns false for non-sensitive keys', () => {
    expect(shouldRedact('APP_NAME')).toBe(false);
    expect(shouldRedact('PORT')).toBe(false);
    expect(shouldRedact('NODE_ENV')).toBe(false);
  });

  it('respects explicit keys list', () => {
    expect(shouldRedact('MY_CUSTOM_KEY', { keys: ['MY_CUSTOM_KEY'] })).toBe(true);
    expect(shouldRedact('OTHER_KEY', { keys: ['MY_CUSTOM_KEY'] })).toBe(false);
  });

  it('respects custom patterns', () => {
    expect(shouldRedact('INTERNAL_VAR', { patterns: [/internal/i] })).toBe(true);
  });
});

describe('redactValue', () => {
  it('returns default placeholder', () => {
    expect(redactValue('supersecret')).toBe('[REDACTED]');
  });

  it('uses custom placeholder', () => {
    expect(redactValue('supersecret', '***')).toBe('***');
  });
});

describe('redactEnvMap', () => {
  const map = makeMap({
    API_KEY: 'abc123',
    APP_NAME: 'myapp',
    DB_PASSWORD: 'hunter2',
    PORT: '3000',
  });

  it('redacts sensitive keys', () => {
    const result = redactEnvMap(map);
    expect(result.get('API_KEY')).toBe('[REDACTED]');
    expect(result.get('DB_PASSWORD')).toBe('[REDACTED]');
  });

  it('preserves non-sensitive keys', () => {
    const result = redactEnvMap(map);
    expect(result.get('APP_NAME')).toBe('myapp');
    expect(result.get('PORT')).toBe('3000');
  });

  it('supports custom placeholder', () => {
    const result = redactEnvMap(map, { placeholder: '***' });
    expect(result.get('API_KEY')).toBe('***');
  });
});

describe('getRedactedKeys', () => {
  it('returns list of keys that would be redacted', () => {
    const map = makeMap({ API_KEY: 'x', APP_NAME: 'y', TOKEN: 'z' });
    const keys = getRedactedKeys(map);
    expect(keys).toContain('API_KEY');
    expect(keys).toContain('TOKEN');
    expect(keys).not.toContain('APP_NAME');
  });
});
