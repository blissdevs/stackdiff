import { DiffResult } from '../diff/envDiffer';

export type ReportFormat = 'text' | 'json';

export interface ReportOptions {
  format?: ReportFormat;
  color?: boolean;
}

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

function colorize(text: string, code: string, useColor: boolean): string {
  return useColor ? `${code}${text}${RESET}` : text;
}

export function formatTextReport(
  diff: DiffResult,
  labelA: string,
  labelB: string,
  useColor = true
): string {
  const lines: string[] = [];

  lines.push(`Comparing: ${labelA} → ${labelB}`);
  lines.push('');

  if (diff.added.length > 0) {
    lines.push('Keys only in ' + labelB + ':');
    for (const key of diff.added) {
      lines.push(colorize(`  + ${key}`, GREEN, useColor));
    }
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push('Keys only in ' + labelA + ':');
    for (const key of diff.removed) {
      lines.push(colorize(`  - ${key}`, RED, useColor));
    }
    lines.push('');
  }

  if (diff.changed.length > 0) {
    lines.push('Changed values:');
    for (const { key, valueA, valueB } of diff.changed) {
      lines.push(colorize(`  ~ ${key}`, YELLOW, useColor));
      lines.push(`      ${labelA}: ${valueA}`);
      lines.push(`      ${labelB}: ${valueB}`);
    }
    lines.push('');
  }

  if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
    lines.push('No differences found.');
  }

  return lines.join('\n');
}

export function formatJsonReport(
  diff: DiffResult,
  labelA: string,
  labelB: string
): string {
  return JSON.stringify({ labelA, labelB, diff }, null, 2);
}

export function generateReport(
  diff: DiffResult,
  labelA: string,
  labelB: string,
  options: ReportOptions = {}
): string {
  const { format = 'text', color = true } = options;
  if (format === 'json') {
    return formatJsonReport(diff, labelA, labelB);
  }
  return formatTextReport(diff, labelA, labelB, color);
}
