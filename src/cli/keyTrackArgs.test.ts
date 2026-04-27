import { parseKeyTrackArgs, hasKeyTrackOptions } from './keyTrackArgs';

describe('parseKeyTrackArgs', () => {
  it('parses source files', () => {
    const args = parseKeyTrackArgs(['.env.dev', '.env.prod']);
    expect(args.sources).toEqual(['.env.dev', '.env.prod']);
  });

  it('parses --missing-only flag', () => {
    const args = parseKeyTrackArgs(['.env.a', '.env.b', '--missing-only']);
    expect(args.missingOnly).toBe(true);
  });

  it('parses --json flag', () => {
    const args = parseKeyTrackArgs(['.env.a', '.env.b', '--json']);
    expect(args.outputJson).toBe(true);
  });

  it('defaults flags to false', () => {
    const args = parseKeyTrackArgs(['.env.a', '.env.b']);
    expect(args.missingOnly).toBe(false);
    expect(args.outputJson).toBe(false);
  });

  it('parses both --missing-only and --json flags together', () => {
    const args = parseKeyTrackArgs(['.env.a', '.env.b', '--missing-only', '--json']);
    expect(args.missingOnly).toBe(true);
    expect(args.outputJson).toBe(true);
  });

  it('does not include flag strings in sources', () => {
    const args = parseKeyTrackArgs(['.env.a', '.env.b', '--missing-only', '--json']);
    expect(args.sources).toEqual(['.env.a', '.env.b']);
  });
});

describe('hasKeyTrackOptions', () => {
  it('returns true when two or more sources provided', () => {
    const args = parseKeyTrackArgs(['.env.a', '.env.b']);
    expect(hasKeyTrackOptions(args)).toBe(true);
  });

  it('returns false when fewer than two sources', () => {
    const args = parseKeyTrackArgs(['.env.a']);
    expect(hasKeyTrackOptions(args)).toBe(false);
  });

  it('returns false when no sources provided', () => {
    const args = parseKeyTrackArgs([]);
    expect(hasKeyTrackOptions(args)).toBe(false);
  });
});
