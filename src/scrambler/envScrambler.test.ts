import {
  shouldScramble,
  scrambleValue,
  scrambleEnvMap,
  getScrambledKeys,
  formatScramblerReport,
} from './envScrambler';
import { EnvMap } from '../parser/envParser';

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe('shouldScramble', () => {
  it('returns true if key is in keys list', () => {
    expect(shouldScramble('SECRET', { keys: ['SECRET'] })).toBe(true);
  });

  it('returns true if key matches pattern', () => {
    expect(shouldScramble('DB_PASSWORD', { pattern: /PASSWORD/ })).toBe(true);
  });

  it('returns false if no match', () => {
    expect(shouldScramble('APP_NAME', { keys: ['SECRET'] })).toBe(false);
  });
});

describe('scrambleValue', () => {
  it('returns default placeholder', () => {
    expect(scrambleValue('myvalue')).toBe('***SCRAMBLED***');
  });

  it('returns custom placeholder', () => {
    expect(scrambleValue('myvalue', '[HIDDEN]')).toBe('[HIDDEN]');
  });
});

describe('scrambleEnvMap', () => {
  const map = makeMap({ APP_NAME: 'myapp', DB_PASSWORD: 'secret123', PORT: '3000' });

  it('scrambles matched keys', () => {
    const result = scrambleEnvMap(map, { pattern: /PASSWORD/ });
    expect(result.get('DB_PASSWORD')).toBe('***SCRAMBLED***');
    expect(result.get('APP_NAME')).toBe('myapp');
  });

  it('uses custom placeholder', () => {
    const result = scrambleEnvMap(map, { keys: ['PORT'], placeholder: 'REDACTED' });
    expect(result.get('PORT')).toBe('REDACTED');
  });

  it('returns full map with same size', () => {
    const result = scrambleEnvMap(map, { keys: ['APP_NAME'] });
    expect(result.size).toBe(map.size);
  });
});

describe('getScrambledKeys', () => {
  it('returns list of scrambled keys', () => {
    const map = makeMap({ A: '1', B: '2', C: '3' });
    const keys = getScrambledKeys(map, { keys: ['A', 'C'] });
    expect(keys).toEqual(expect.arrayContaining(['A', 'C']));
    expect(keys).not.toContain('B');
  });
});

describe('formatScramblerReport', () => {
  it('includes scrambled key count', () => {
    const map = makeMap({ SECRET: 'x', NAME: 'y' });
    const scrambled = scrambleEnvMap(map, { keys: ['SECRET'] });
    const report = formatScramblerReport(map, scrambled, { keys: ['SECRET'] });
    expect(report).toContain('Scrambled keys: 1');
    expect(report).toContain('[SCRAMBLED] SECRET');
  });
});
