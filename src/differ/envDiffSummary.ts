import { EnvDiff } from '../diff/envDiffer';

export interface DiffSummary {
  totalKeys: number;
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
  addedKeys: string[];
  removedKeys: string[];
  changedKeys: string[];
}

export function summarizeDiff(diff: EnvDiff): DiffSummary {
  const addedKeys = Object.keys(diff).filter(k => diff[k].status === 'added');
  const removedKeys = Object.keys(diff).filter(k => diff[k].status === 'removed');
  const changedKeys = Object.keys(diff).filter(k => diff[k].status === 'changed');
  const unchangedKeys = Object.keys(diff).filter(k => diff[k].status === 'unchanged');

  return {
    totalKeys: Object.keys(diff).length,
    addedCount: addedKeys.length,
    removedCount: removedKeys.length,
    changedCount: changedKeys.length,
    unchangedCount: unchangedKeys.length,
    addedKeys,
    removedKeys,
    changedKeys,
  };
}

export function formatSummary(summary: DiffSummary): string {
  const lines: string[] = [
    `Total keys: ${summary.totalKeys}`,
    `  Added:     ${summary.addedCount}`,
    `  Removed:   ${summary.removedCount}`,
    `  Changed:   ${summary.changedCount}`,
    `  Unchanged: ${summary.unchangedCount}`,
  ];

  if (summary.addedKeys.length > 0) {
    lines.push(`\nAdded keys: ${summary.addedKeys.join(', ')}`);
  }
  if (summary.removedKeys.length > 0) {
    lines.push(`Removed keys: ${summary.removedKeys.join(', ')}`);
  }
  if (summary.changedKeys.length > 0) {
    lines.push(`Changed keys: ${summary.changedKeys.join(', ')}`);
  }

  return lines.join('\n');
}

export function summaryToJson(summary: DiffSummary): string {
  return JSON.stringify(summary, null, 2);
}
