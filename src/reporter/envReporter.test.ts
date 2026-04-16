import { generateReport, formatTextReport, formatJsonReport } from './envReporter';
import { DiffResult } from '../diff/envDiffer';

const sampleDiff: DiffResult = {
  added: ['NEW_KEY'],
  removed: ['OLD_KEY'],
  changed: [{ key: 'API_URL', valueA: 'http://localhost', valueB: 'https://prod.example.com' }],
  unchanged: ['SHARED_KEY'],
};

describe('formatTextReport', () => {
  it('includes label names', () => {
    const report = formatTextReport(sampleDiff, '.env.local', '.env.prod', false);
    expect(report).toContain('.env.local');
    expect(report).toContain('.env.prod');
  });

  it('shows added keys with +', () => {
    const report = formatTextReport(sampleDiff, 'A', 'B', false);
    expect(report).toContain('+ NEW_KEY');
  });

  it('shows removed keys with -', () => {
    const report = formatTextReport(sampleDiff, 'A', 'B', false);
    expect(report).toContain('- OLD_KEY');
  });

  it('shows changed keys with ~', () => {
    const report = formatTextReport(sampleDiff, 'A', 'B', false);
    expect(report).toContain('~ API_URL');
    expect(report).toContain('http://localhost');
    expect(report).toContain('https://prod.example.com');
  });

  it('shows no differences message when diff is empty', () => {
    const emptyDiff: DiffResult = { added: [], removed: [], changed: [], unchanged: [] };
    const report = formatTextReport(emptyDiff, 'A', 'B', false);
    expect(report).toContain('No differences found.');
  });
});

describe('formatJsonReport', () => {
  it('returns valid JSON', () => {
    const report = formatJsonReport(sampleDiff, 'A', 'B');
    expect(() => JSON.parse(report)).not.toThrow();
  });

  it('includes labelA and labelB in output', () => {
    const report = formatJsonReport(sampleDiff, 'envA', 'envB');
    const parsed = JSON.parse(report);
    expect(parsed.labelA).toBe('envA');
    expect(parsed.labelB).toBe('envB');
  });

  it('includes diff data', () => {
    const report = formatJsonReport(sampleDiff, 'A', 'B');
    const parsed = JSON.parse(report);
    expect(parsed.diff.added).toContain('NEW_KEY');
  });
});

describe('generateReport', () => {
  it('defaults to text format', () => {
    const report = generateReport(sampleDiff, 'A', 'B', { color: false });
    expect(report).toContain('Comparing:');
  });

  it('uses json format when specified', () => {
    const report = generateReport(sampleDiff, 'A', 'B', { format: 'json' });
    expect(() => JSON.parse(report)).not.toThrow();
  });
});
