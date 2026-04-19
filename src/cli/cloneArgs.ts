export interface CloneArgs {
  prefix: string;
  suffix: string;
  overwrite: boolean;
  keys: string[];
}

export function parseCloneArgs(argv: string[]): CloneArgs {
  const args: CloneArgs = {
    prefix: '',
    suffix: '',
    overwrite: false,
    keys: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--prefix' && argv[i + 1]) {
      args.prefix = argv[++i];
    } else if (arg === '--suffix' && argv[i + 1]) {
      args.suffix = argv[++i];
    } else if (arg === '--overwrite') {
      args.overwrite = true;
    } else if (arg === '--keys' && argv[i + 1]) {
      args.keys = argv[++i].split(',').map(k => k.trim());
    }
  }

  return args;
}

export function hasCloneOptions(args: CloneArgs): boolean {
  return !!args.prefix || !!args.suffix || args.overwrite || args.keys.length > 0;
}
