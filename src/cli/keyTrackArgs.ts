export interface KeyTrackArgs {
  sources: string[];
  missingOnly: boolean;
  outputJson: boolean;
}

export function parseKeyTrackArgs(argv: string[]): KeyTrackArgs {
  const sources: string[] = [];
  let missingOnly = false;
  let outputJson = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--missing-only') {
      missingOnly = true;
    } else if (arg === '--json') {
      outputJson = true;
    } else if (!arg.startsWith('--')) {
      sources.push(arg);
    }
  }

  return { sources, missingOnly, outputJson };
}

export function hasKeyTrackOptions(args: KeyTrackArgs): boolean {
  return args.sources.length >= 2;
}
