import { cloneEnvMap, formatCloneReport } from './envCloner';

const makeMap = (obj: Record<string, string>) => new Map(Object.entries(obj));

describe('cloneEnvMap', () => {
  it('clones all keys from source into empty target', () => {
    const source = makeMap({ FOO: 'foo', BAR: 'bar' });
    const target = new Map<string, string>();
    const { cloned, added, skipped } = cloneEnvMap(source, target);
    expect(added).toEqual(['FOO', 'BAR']);
    expect(skipped).toHaveLength(0);
    expect(cloned.get('FOO')).toBe('foo');
  });

  it('skips keys that already exist without overwrite', () => {
    const source = makeMap({ FOO: 'new' });
    const target = makeMap({ FOO: 'old' });
    const { cloned, skipped } = cloneEnvMap(source, target);
    expect(skipped).toContain('FOO');
    expect(cloned.get('FOO')).toBe('old');
  });

  it('overwrites keys when overwrite=true', () => {
    const source = makeMap({ FOO: 'new' });
    const target = makeMap({ FOO: 'old' });
    const { cloned, added } = cloneEnvMap(source, target, { overwrite: true });
    expect(added).toContain('FOO');
    expect(cloned.get('FOO')).toBe('new');
  });

  it('applies prefix to cloned keys', () => {
    const source = makeMap({ FOO: 'bar' });
    const { cloned, added } = cloneEnvMap(source, new Map(), { prefix: 'COPY_' });
    expect(added).toContain('COPY_FOO');
    expect(cloned.has('COPY_FOO')).toBe(true);
  });

  it('applies suffix to cloned keys', () => {
    const source = makeMap({ FOO: 'bar' });
    const { cloned } = cloneEnvMap(source, new Map(), { suffix: '_CLONE' });
    expect(cloned.has('FOO_CLONE')).toBe(true);
  });

  it('only clones specified keys', () => {
    const source = makeMap({ FOO: '1', BAR: '2', BAZ: '3' });
    const { added } = cloneEnvMap(source, new Map(), { keys: ['FOO', 'BAZ'] });
    expect(added).toEqual(['FOO', 'BAZ']);
    expect(added).not.toContain('BAR');
  });
});

describe('formatCloneReport', () => {
  it('formats a report with added and skipped keys', () => {
    const result = { cloned: new Map(), added: ['FOO', 'BAR'], skipped: ['BAZ'] };
    const report = formatCloneReport(result);
    expect(report).toContain('Cloned: 2');
    expect(report).toContain('+ FOO');
    expect(report).toContain('Skipped');
    expect(report).toContain('~ BAZ');
  });
});
