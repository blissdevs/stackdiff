import {
  createProfile,
  matchProfile,
  formatProfileReport,
} from './envProfiler';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('createProfile', () => {
  it('creates a profile with unique keys', () => {
    const p = createProfile('prod', ['A', 'B', 'A'], 'production');
    expect(p.name).toBe('prod');
    expect(p.keys).toEqual(['A', 'B']);
    expect(p.description).toBe('production');
    expect(p.createdAt).toBeDefined();
  });
});

describe('matchProfile', () => {
  const profile = createProfile('base', ['DB_URL', 'API_KEY', 'PORT']);

  it('calculates full match', () => {
    const env = makeMap({ DB_URL: 'x', API_KEY: 'y', PORT: '3000' });
    const result = matchProfile(env, profile);
    expect(result.score).toBe(1);
    expect(result.missing).toHaveLength(0);
    expect(result.extra).toHaveLength(0);
  });

  it('detects missing keys', () => {
    const env = makeMap({ DB_URL: 'x' });
    const result = matchProfile(env, profile);
    expect(result.missing).toContain('API_KEY');
    expect(result.missing).toContain('PORT');
    expect(result.score).toBeCloseTo(1 / 3);
  });

  it('detects extra keys', () => {
    const env = makeMap({ DB_URL: 'x', API_KEY: 'y', PORT: '3000', EXTRA: 'z' });
    const result = matchProfile(env, profile);
    expect(result.extra).toContain('EXTRA');
    expect(result.score).toBe(1);
  });

  it('handles empty profile', () => {
    const empty = createProfile('empty', []);
    const result = matchProfile(makeMap({ A: '1' }), empty);
    expect(result.score).toBe(1);
  });
});

describe('formatProfileReport', () => {
  it('includes profile name and score', () => {
    const profile = createProfile('test', ['A', 'B']);
    const result = matchProfile(makeMap({ A: '1' }), profile);
    const report = formatProfileReport(result);
    expect(report).toContain('Profile: test');
    expect(report).toContain('50.0%');
    expect(report).toContain('Missing');
  });
});
