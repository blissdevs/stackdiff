import { EnvMap } from '../parser/envParser';

export interface PruneOptions {
  removeEmpty?: boolean;
  removeCommented?: boolean;
  removeDuplicateValues?: boolean;
  removeKeys?: string[];
}

export interface PruneReport {
  original: number;
  pruned: number;
  removed: string[];
  result: EnvMap;
}

export function pruneEnvMap(env: EnvMap, options: PruneOptions = {}): PruneReport {
  const removed: string[] = [];
  const result: EnvMap = new Map();
  const seenValues = new Set<string>();

  for (const [key, value] of env.entries()) {
    if (options.removeKeys?.includes(key)) {
      removed.push(key);
      continue;
    }
    if (options.removeEmpty && value.trim() === '') {
      removed.push(key);
      continue;
    }
    if (options.removeDuplicateValues && seenValues.has(value)) {
      removed.push(key);
      continue;
    }
    seenValues.add(value);
    result.set(key, value);
  }

  return {
    original: env.size,
    pruned: result.size,
    removed,
    result,
  };
}

export function formatPruneReport(report: PruneReport): string {
  const lines: string[] = [];
  lines.push(`Prune Report: ${report.original} → ${report.pruned} keys`);
  if (report.removed.length === 0) {
    lines.push('  No keys removed.');
  } else {
    lines.push(`  Removed (${report.removed.length}):`);
    for (const key of report.removed) {
      lines.push(`    - ${key}`);
    }
  }
  return lines.join('\n');
}
