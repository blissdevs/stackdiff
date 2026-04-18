import { summarizeDiff, formatSummary, summaryToJson } from './envDiffSummary';
import { EnvDiff } from '../diff/envDiffer';

const sampleDiff: EnvDiff = {
  API_URL: { status: 'changed', left: 'http://old', right: 'http://new' },
  DB_HOST: { status: 'unchanged', left: 'localhost', right: 'localhost' },
  NEW_KEY: { status: 'added', left: undefined, right: 'value' },
  OLD_KEY: { status: 'removed', left: 'gone', right: undefined },
};

describe('summarizeDiff', () => {
  it('counts all statuses correctly', () => {
    const summary = summarizeDiff(sampleDiff);
    expect(summary.totalKeys).toBe(4);
    expect(summary.addedCount).toBe(1);
    expect(summary.removedCount).toBe(1);
    expect(summary.changedCount).toBe(1);
    expect(summary.unchangedCount).toBe(1);
  });

  it('lists keys by status', () => {
    const summary = summarizeDiff(sampleDiff);
    expect(summary.addedKeys).toEqual(['NEW_KEY']);
    expect(summary.removedKeys).toEqual(['OLD_KEY']);
    expect(summary.changedKeys).toEqual(['API_URL']);
  });

  it('handles empty diff', () => {
    const summary = summarizeDiff({});
    expect(summary.totalKeys).toBe(0);
    expect(summary.addedCount).toBe(0);
  });
});

describe('formatSummary', () => {
  it('includes counts in output', () => {
    const summary = summarizeDiff(sampleDiff);
    const output = formatSummary(summary);
    expect(output).toContain('Total keys: 4');
    expect(output).toContain('Added:     1');
    expect(output).toContain('NEW_KEY');
    expect(output).toContain('OLD_KEY');
  });
});

describe('summaryToJson', () => {
  it('returns valid JSON', () => {
    const summary = summarizeDiff(sampleDiff);
    const json = summaryToJson(summary);
    const parsed = JSON.parse(json);
    expect(parsed.totalKeys).toBe(4);
  });
});
