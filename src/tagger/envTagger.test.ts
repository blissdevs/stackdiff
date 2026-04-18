import { tagEnvMap, filterByTag, formatTagReport, getTagSummary } from './envTagger';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

const rules = {
  secret: (k: string) => /secret|password|token/i.test(k),
  url: (_k: string, v: string) => v.startsWith('http'),
  empty: (_k: string, v: string) => v === '',
};

describe('tagEnvMap', () => {
  it('tags keys matching rules', () => {
    const map = makeMap({ DB_PASSWORD: 'abc', API_URL: 'https://x.com', NAME: 'bob' });
    const tagged = tagEnvMap(map, rules);
    expect(tagged.tags.get('DB_PASSWORD')).toContain('secret');
    expect(tagged.tags.get('API_URL')).toContain('url');
    expect(tagged.tags.has('NAME')).toBe(false);
  });

  it('applies multiple tags to same key', () => {
    const map = makeMap({ SECRET_URL: 'https://secret.io' });
    const tagged = tagEnvMap(map, rules);
    const t = tagged.tags.get('SECRET_URL') ?? [];
    expect(t).toContain('secret');
    expect(t).toContain('url');
  });

  it('tags empty values', () => {
    const map = makeMap({ EMPTY_KEY: '' });
    const tagged = tagEnvMap(map, rules);
    expect(tagged.tags.get('EMPTY_KEY')).toContain('empty');
  });
});

describe('filterByTag', () => {
  it('returns only keys with given tag', () => {
    const map = makeMap({ DB_TOKEN: 'x', API_URL: 'https://a.com', NAME: 'y' });
    const tagged = tagEnvMap(map, rules);
    const secrets = filterByTag(tagged, 'secret');
    expect(secrets.has('DB_TOKEN')).toBe(true);
    expect(secrets.has('API_URL')).toBe(false);
  });
});

describe('formatTagReport', () => {
  it('formats tag lines', () => {
    const map = makeMap({ DB_PASSWORD: 'x' });
    const tagged = tagEnvMap(map, rules);
    const report = formatTagReport(tagged);
    expect(report).toContain('DB_PASSWORD');
    expect(report).toContain('secret');
  });

  it('returns placeholder when no tags', () => {
    const tagged = tagEnvMap(makeMap({ PLAIN: 'value' }), rules);
    expect(formatTagReport(tagged)).toBe('(no tags matched)');
  });
});

describe('getTagSummary', () => {
  it('counts tags', () => {
    const map = makeMap({ DB_PASSWORD: 'x', API_TOKEN: 'y', SITE: 'https://a.com' });
    const tagged = tagEnvMap(map, rules);
    const summary = getTagSummary(tagged);
    expect(summary['secret']).toBe(2);
    expect(summary['url']).toBe(1);
  });
});
