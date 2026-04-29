import {
  buildRenameMap,
  replaceKeyPrefix,
  renameEnvKeys,
  formatRenameReport,
} from './envRenamer';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('buildRenameMap', () => {
  it('parses key=value pairs', () => {
    const map = buildRenameMap(['OLD_KEY=NEW_KEY', 'FOO=BAR']);
    expect(map['OLD_KEY']).toBe('NEW_KEY');
    expect(map['FOO']).toBe('BAR');
  });

  it('ignores malformed pairs', () => {
    const map = buildRenameMap(['NOEQUALS', '=NOKEY']);
    expect(Object.keys(map)).toHaveLength(0);
  });
});

describe('replaceKeyPrefix', () => {
  it('replaces matching prefix', () => {
    expect(replaceKeyPrefix('APP_HOST', 'APP_', 'SERVICE_')).toBe('SERVICE_HOST');
  });

  it('returns key unchanged when prefix does not match', () => {
    expect(replaceKeyPrefix('DB_HOST', 'APP_', 'SERVICE_')).toBe('DB_HOST');
  });
});

describe('renameEnvKeys', () => {
  it('renames keys according to map', () => {
    const env = makeMap({ OLD_KEY: 'value', OTHER: 'x' });
    const { renamed } = renameEnvKeys(env, { OLD_KEY: 'NEW_KEY' });
    expect(renamed.get('NEW_KEY')).toBe('value');
    expect(renamed.has('OLD_KEY')).toBe(false);
    expect(renamed.get('OTHER')).toBe('x');
  });

  it('detects conflicts when target key already exists', () => {
    const env = makeMap({ OLD_KEY: 'v1', NEW_KEY: 'v2' });
    const { conflicts, renamed } = renameEnvKeys(env, { OLD_KEY: 'NEW_KEY' });
    expect(conflicts).toContain('OLD_KEY');
    expect(renamed.get('OLD_KEY')).toBe('v1');
  });

  it('returns skipped list of original renamed keys', () => {
    const env = makeMap({ A: '1', B: '2' });
    const { skipped } = renameEnvKeys(env, { A: 'ALPHA' });
    expect(skipped).toContain('A');
  });
});

describe('formatRenameReport', () => {
  it('includes renamed count', () => {
    const env = makeMap({ A: '1' });
    const result = renameEnvKeys(env, { A: 'ALPHA' });
    const report = formatRenameReport(result);
    expect(report).toContain('Renamed: 1');
  });

  it('includes conflict info when present', () => {
    const env = makeMap({ A: '1', B: '2' });
    const result = renameEnvKeys(env, { A: 'B' });
    const report = formatRenameReport(result);
    expect(report).toContain('Conflicts');
  });
});
