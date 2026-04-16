import { runComparePipeline, runMultiComparePipeline } from './comparePipeline';
import { LoadedEnv } from '../loader';

const makeEnv = (name: string, map: Record<string, string>): LoadedEnv => ({
  name,
  map,
  source: { type: 'inline', name, content: '' },
});

describe('runComparePipeline', () => {
  it('returns no differences for identical envs', () => {
    const base = makeEnv('base', { FOO: 'bar' });
    const compare = makeEnv('compare', { FOO: 'bar' });
    const result = runComparePipeline(base, compare, { format: 'text', color: false });
    expect(result.hasDifferences).toBe(false);
    expect(result.output).toBeTruthy();
  });

  it('detects differences', () => {
    const base = makeEnv('base', { FOO: 'bar', ONLY_BASE: '1' });
    const compare = makeEnv('compare', { FOO: 'changed', ONLY_COMPARE: '2' });
    const result = runComparePipeline(base, compare, { format: 'text', color: false });
    expect(result.hasDifferences).toBe(true);
  });

  it('returns json format when requested', () => {
    const base = makeEnv('base', { A: '1' });
    const compare = makeEnv('compare', { A: '2' });
    const result = runComparePipeline(base, compare, { format: 'json', color: false });
    const parsed = JSON.parse(result.output);
    expect(parsed).toHaveProperty('base');
    expect(parsed).toHaveProperty('compare');
  });
});

describe('runMultiComparePipeline', () => {
  it('returns results for each target', () => {
    const base = makeEnv('base', { X: '1' });
    const targets = [
      makeEnv('t1', { X: '1' }),
      makeEnv('t2', { X: '2' }),
    ];
    const results = runMultiComparePipeline(base, targets, { format: 'text', color: false });
    expect(results).toHaveLength(2);
    expect(results[0].hasDifferences).toBe(false);
    expect(results[1].hasDifferences).toBe(true);
  });
});
