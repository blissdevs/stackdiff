import { Command } from 'commander';

export interface CliOptions {
  files: string[];
  inline?: string[];
  format: 'text' | 'json';
  strict: boolean;
  keys?: string[];
}

export function parseCliArgs(argv: string[] = process.argv): CliOptions {
  const program = new Command();

  program
    .name('stackdiff')
    .description('Compare environment variable sets across .env files and deployment configs')
    .version('1.0.0');

  program
    .option('-f, --files <paths...>', 'paths to .env files to compare')
    .option('-i, --inline <pairs...>', 'inline KEY=VALUE pairs to compare')
    .option('--format <type>', 'output format: text or json', 'text')
    .option('--strict', 'exit with non-zero code if any diff is found', false)
    .option('--keys <keys...>', 'only compare specific keys');

  program.parse(argv);

  const opts = program.opts();

  const files: string[] = opts.files ?? [];
  const inline: string[] | undefined = opts.inline;

  if (files.length === 0 && (!inline || inline.length === 0)) {
    console.error('Error: provide at least one --files or --inline source.');
    process.exit(1);
  }

  const format = opts.format === 'json' ? 'json' : 'text';

  return {
    files,
    inline,
    format,
    strict: Boolean(opts.strict),
    keys: opts.keys,
  };
}
