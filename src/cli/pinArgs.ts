export type PinArgs = {
  keys: string[];
  pinFile: string | undefined;
  check: boolean;
  outputJson: boolean;
};

export function parsePinArgs(argv: string[]): PinArgs {
  const keys: string[] = [];
  let pinFile: string | undefined;
  let check = false;
  let outputJson = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--pin-key' && argv[i + 1]) {
      keys.push(argv[++i]);
    } else if (arg === '--pin-file' && argv[i + 1]) {
      pinFile = argv[++i];
    } else if (arg === '--check') {
      check = true;
    } else if (arg === '--json') {
      outputJson = true;
    }
  }

  return { keys, pinFile, check, outputJson };
}

export function hasPinOptions(args: PinArgs): boolean {
  return args.keys.length > 0 || args.pinFile !== undefined;
}
