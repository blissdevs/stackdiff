import { SortOptions, SortOrder } from '../sorter';

export interface SortArgs {
  order: SortOrder;
  groupByPrefix: boolean;
  prefixDelimiter: string;
}

export function parseSortArgs(argv: string[]): SortArgs {
  const args: SortArgs = {
    order: 'asc',
    groupByPrefix: false,
    prefixDelimiter: '_',
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === '--sort-order' || arg === '-o') && argv[i + 1]) {
      const val = argv[++i];
      if (val === 'asc' || val === 'desc') {
        args.order = val;
      }
    } else if (arg === '--group-by-prefix' || arg === '-g') {
      args.groupByPrefix = true;
    } else if ((arg === '--prefix-delimiter' || arg === '-d') && argv[i + 1]) {
      args.prefixDelimiter = argv[++i];
    }
  }

  return args;
}

export function hasSortOptions(args: SortArgs): boolean {
  return (
    args.order !== 'asc' ||
    args.groupByPrefix ||
    args.prefixDelimiter !== '_'
  );
}

export function sortArgsToOptions(args: SortArgs): SortOptions {
  return {
    order: args.order,
    groupByPrefix: args.groupByPrefix,
    prefixDelimiter: args.prefixDelimiter,
  };
}
