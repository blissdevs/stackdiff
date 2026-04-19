export interface FreezeArgs {
  keys: string[];
  protect: string[];
  report: boolean;
}

export function parseFreezeArgs(argv: string[]): FreezeArgs {
  const keys: string[] = [];
  const protect: string[] = [];
  let report = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === "--key" || arg === "-k") && argv[i + 1]) {
      keys.push(...argv[++i].split(","));
    } else if ((arg === "--protect" || arg === "-p") && argv[i + 1]) {
      protect.push(...argv[++i].split(","));
    } else if (arg === "--report" || arg === "-r") {
      report = true;
    }
  }

  return { keys, protect, report };
}

export function hasFreezeOptions(args: FreezeArgs): boolean {
  return args.keys.length > 0 || args.protect.length > 0;
}
