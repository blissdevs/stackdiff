export interface ClassifyArgs {
  category?: string;
  showUnknown: boolean;
  json: boolean;
  summary: boolean;
}

export function parseClassifyArgs(argv: string[]): ClassifyArgs {
  const args: ClassifyArgs = {
    showUnknown: false,
    json: false,
    summary: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--category" && argv[i + 1]) {
      args.category = argv[++i];
    } else if (arg === "--show-unknown") {
      args.showUnknown = true;
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--summary") {
      args.summary = true;
    }
  }

  return args;
}

export function hasClassifyOptions(args: ClassifyArgs): boolean {
  return !!args.category || args.showUnknown || args.json || args.summary;
}
