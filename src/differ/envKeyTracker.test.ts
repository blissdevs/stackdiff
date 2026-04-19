import { trackKeyPresence, getMissingKeys, formatKeyPresenceReport } from './envKeyTracker';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('trackKeyPresence', () => {
  it('marks keys present in all sources', () => {
    const maps = new Map([
      ['a', makeMap({ FOO: '1', BAR: '2' })],
      ['b', makeMap({ FOO: '1', BAR: '3' })],
    ]);
    const result = trackKeyPresence(maps);
    expect(result.find((p) => p.key === 'FOO')?.missingFrom).toEqual([]);
  });

  it('marks keys missing from some sources', () => {
    const maps = new Map([
      ['a', makeMap({ FOO: '1' })],
      ['b', makeMap({ BAR: '2' })],
    ]);
    const result = trackKeyPresence(maps);
    const foo = result.find((p) => p.key === 'FOO')!;
    expect(foo.missingFrom).toContain('b');
  });

  it('returns sorted keys', () => {
    const maps = new Map([['x', makeMap({ Z: '1', A: '2' })]]);
    const result = trackKeyPresence(maps);
    expect(result[0].key).toBe('A');
  });
});

describe('getMissingKeys', () => {
  it('filters to keys with missing sources only', () => {
    const maps = new Map([
      ['a', makeMap({ FOO: '1', BAR: '2' })],
      ['b', makeMap({ FOO: '1' })],
    ]);
    const presence = trackKeyPresence(maps);
    const missing = getMissingKeys(presence);
    expect(missing.map((p) => p.key)).toEqual(['BAR']);
  });
});

describe('formatKeyPresenceReport', () => {
  it('includes header and key status', () => {
    const maps = new Map([
      ['a', makeMap({ FOO: '1' })],
      ['b', makeMap({ FOO: '1', BAR: '2' })],
    ]);
    const presence = trackKeyPresence(maps);
    const report = formatKeyPresenceReport(presence);
    expect(report).toContain('Key Presence Report');
    expect(report).toContain('✗ FOO');
    expect(report).toContain('✓ BAR');
  });
});
