import { transformKey, transformValue, transformEnvMap } from './envTransformer';

describe('transformKey', () => {
  it('applies keyCase upper', () => {
    expect(transformKey('my_key', { keyCase: 'upper' })).toBe('MY_KEY');
  });

  it('applies keyCase lower', () => {
    expect(transformKey('MY_KEY', { keyCase: 'lower' })).toBe('my_key');
  });

  it('applies prefix and suffix', () => {
    expect(transformKey('KEY', { keyPrefix: 'APP_', keySuffix: '_V2' })).toBe('APP_KEY_V2');
  });

  it('returns key unchanged with no options', () => {
    expect(transformKey('KEY', {})).toBe('KEY');
  });
});

describe('transformValue', () => {
  it('applies value prefix and suffix', () => {
    expect(transformValue('K', 'val', { valuePrefix: '[', valueSuffix: ']' })).toBe('[val]');
  });

  it('applies custom transform', () => {
    const custom = (_k: string, v: string) => v.toUpperCase();
    expect(transformValue('K', 'hello', { custom })).toBe('HELLO');
  });

  it('chains prefix and custom', () => {
    const custom = (_k: string, v: string) => v + '!';
    expect(transformValue('K', 'hi', { valuePrefix: '>', custom })).toBe('>hi!');
  });
});

describe('transformEnvMap', () => {
  const base = new Map([['db_host', 'localhost'], ['db_port', '5432']]);

  it('transforms all keys to upper', () => {
    const result = transformEnvMap(base, { keyCase: 'upper' });
    expect(result.has('DB_HOST')).toBe(true);
    expect(result.has('DB_PORT')).toBe(true);
  });

  it('adds key prefix', () => {
    const result = transformEnvMap(base, { keyPrefix: 'X_' });
    expect([...result.keys()]).toEqual(['X_db_host', 'X_db_port']);
  });

  it('preserves value when no value opts', () => {
    const result = transformEnvMap(base, { keyCase: 'upper' });
    expect(result.get('DB_HOST')).toBe('localhost');
  });

  it('returns empty map for empty input', () => {
    const result = transformEnvMap(new Map(), { keyCase: 'upper' });
    expect(result.size).toBe(0);
  });
});
