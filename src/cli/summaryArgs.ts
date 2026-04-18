export interface SummaryArgs {
  format: 'text' | 'json';
  showUnchanged: boolean;
  onlyKeys: boolean;
}

export function parseSummaryArgs(argv: string[]): SummaryArgs {
  const format = argv.includes('--json') ? 'json' : 'text';
  const showUnchanged = argv.includes('--show-unchanged');
  const onlyKeys = argv.includes('--only-keys');
  return { format, showUnchanged, onlyKeys };
}

export function hasSummaryFlag(argv: string[]): boolean {
  return argv.includes('--summary');
}
