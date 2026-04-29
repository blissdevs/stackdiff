import { parseArgs } from 'node:util';

export interface RenameArgs {
  pairs: string[];
  oldPrefix?: string;
  newPrefix?: string;
  dryRun: boolean;
  output?: string;
}

export function parseRenameArgs(argv: string[]): RenameArgs {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      rename: { type: 'string', multiple: true, short: 'r' },
      'old-prefix': { type: 'string' },
      'new-prefix': { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      output: { type: 'string', short: 'o' },
    },
  });

  return {
    pairs: (values['rename'] as string[] | undefined) ?? [],
    oldPrefix: values['old-prefix'] as string | undefined,
    newPrefix: values['new-prefix'] as string | undefined,
    dryRun: (values['dry-run'] as boolean) ?? false,
    output: values['output'] as string | undefined,
  };
}

export function hasRenameOptions(args: RenameArgs): boolean {
  return (
    args.pairs.length > 0 ||
    (args.oldPrefix !== undefined && args.newPrefix !== undefined)
  );
}
