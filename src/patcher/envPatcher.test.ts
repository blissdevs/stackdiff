import { applyPatch, buildPatchFromDiff, formatPatchReport, PatchOperation } from './envPatcher';

const makeMap = (obj: Record<string, string>) => new Map(Object.entries(obj));

describe('applyPatch', () => {
  it('applies set operations', () => {
    const base = makeMap({ A: '1', B: '2' });
    const ops: PatchOperation[] = [{ op: 'set', key: 'C', value: '3' }];
    const { patched, applied, skipped } = applyPatch(base, ops);
    expect(patched.get('C')).toBe('3');
    expect(applied).toHaveLength(1);
    expect(skipped).toHaveLength(0);
  });

  it('applies delete operations', () => {
    const base = makeMap({ A: '1', B: '2' });
    const ops: PatchOperation[] = [{ op: 'delete', key: 'A' }];
    const { patched } = applyPatch(base, ops);
    expect(patched.has('A')).toBe(false);
    expect(patched.has('B')).toBe(true);
  });

  it('skips delete for missing key', () => {
    const base = makeMap({ A: '1' });
    const ops: PatchOperation[] = [{ op: 'delete', key: 'Z' }];
    const { skipped } = applyPatch(base, ops);
    expect(skipped).toHaveLength(1);
  });

  it('applies rename operations', () => {
    const base = makeMap({ OLD: 'val' });
    const ops: PatchOperation[] = [{ op: 'rename', from: 'OLD', to: 'NEW' }];
    const { patched } = applyPatch(base, ops);
    expect(patched.has('OLD')).toBe(false);
    expect(patched.get('NEW')).toBe('val');
  });

  it('skips rename for missing key', () => {
    const base = makeMap({ A: '1' });
    const ops: PatchOperation[] = [{ op: 'rename', from: 'MISSING', to: 'NEW' }];
    const { skipped } = applyPatch(base, ops);
    expect(skipped).toHaveLength(1);
  });
});

describe('buildPatchFromDiff', () => {
  it('generates set ops for new and changed keys', () => {
    const before = makeMap({ A: '1', B: '2' });
    const after = makeMap({ A: '1', B: '99', C: '3' });
    const ops = buildPatchFromDiff(before, after);
    expect(ops).toContainEqual({ op: 'set', key: 'B', value: '99' });
    expect(ops).toContainEqual({ op: 'set', key: 'C', value: '3' });
  });

  it('generates delete ops for removed keys', () => {
    const before = makeMap({ A: '1', B: '2' });
    const after = makeMap({ A: '1' });
    const ops = buildPatchFromDiff(before, after);
    expect(ops).toContainEqual({ op: 'delete', key: 'B' });
  });
});

describe('formatPatchReport', () => {
  it('formats applied and skipped ops', () => {
    const base = makeMap({ A: '1' });
    const ops: PatchOperation[] = [
      { op: 'set', key: 'B', value: '2' },
      { op: 'delete', key: 'MISSING' },
    ];
    const result = applyPatch(base, ops);
    const report = formatPatchReport(result);
    expect(report).toContain('Applied: 1');
    expect(report).toContain('Skipped: 1');
    expect(report).toContain('SET B=2');
    expect(report).toContain('SKIPPED DELETE MISSING');
  });
});
