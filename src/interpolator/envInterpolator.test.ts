import { interpolateValue, interpolateEnvMap, findUnresolvedRefs } from './envInterpolator';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('interpolateValue', () => {
  it('replaces a single reference', () => {
    const env = makeMap({ BASE: 'http://localhost' });
    expect(interpolateValue('${BASE}/api', env)).toBe('http://localhost/api');
  });

  it('replaces multiple references', () => {
    const env = makeMap({ HOST: 'localhost', PORT: '3000' });
    expect(interpolateValue('${HOST}:${PORT}', env)).toBe('localhost:3000');
  });

  it('leaves unresolved references as-is', () => {
    const env = makeMap({});
    expect(interpolateValue('${MISSING}', env)).toBe('${MISSING}');
  });

  it('returns plain value unchanged', () => {
    const env = makeMap({ A: '1' });
    expect(interpolateValue('no-refs', env)).toBe('no-refs');
  });
});

describe('interpolateEnvMap', () => {
  it('resolves references across the map', () => {
    const env = makeMap({ BASE: 'https://api.example.com', URL: '${BASE}/v1' });
    const result = interpolateEnvMap(env);
    expect(result.get('URL')).toBe('https://api.example.com/v1');
    expect(result.get('BASE')).toBe('https://api.example.com');
  });

  it('leaves circular/unresolvable refs as-is', () => {
    const env = makeMap({ A: '${B}', B: '${A}' });
    const result = interpolateEnvMap(env);
    expect(result.get('A')).toBe('${B}');
    expect(result.get('B')).toBe('${A}');
  });

  it('handles empty map', () => {
    expect(interpolateEnvMap(new Map()).size).toBe(0);
  });
});

describe('findUnresolvedRefs', () => {
  it('returns keys with unresolved references', () => {
    const env = makeMap({ FOO: '${MISSING}', BAR: 'ok' });
    expect(findUnresolvedRefs(env)).toContain('FOO');
    expect(findUnresolvedRefs(env)).not.toContain('BAR');
  });

  it('returns empty array when all refs resolved', () => {
    const env = makeMap({ BASE: 'val', FULL: '${BASE}/path' });
    expect(findUnresolvedRefs(env)).toHaveLength(0);
  });
});
