/**
 * weighArgs.ts
 * CLI argument parsing for the `weigh` command.
 */

export interface WeighArgs {
  keyLengthFactor?: number;
  valueLengthFactor?: number;
  sensitiveBonus?: number;
  prefixDepthFactor?: number;
  format: 'text' | 'json';
  topN?: number;
}

export function parseWeighArgs(argv: string[]): WeighArgs {
  const args: WeighArgs = { format: 'text' };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    switch (arg) {
      case '--key-length-factor':
        args.keyLengthFactor = parseFloat(next);
        i++;
        break;
      case '--value-length-factor':
        args.valueLengthFactor = parseFloat(next);
        i++;
        break;
      case '--sensitive-bonus':
        args.sensitiveBonus = parseFloat(next);
        i++;
        break;
      case '--prefix-depth-factor':
        args.prefixDepthFactor = parseFloat(next);
        i++;
        break;
      case '--format':
        if (next === 'json' || next === 'text') {
          args.format = next;
        }
        i++;
        break;
      case '--top':
        args.topN = parseInt(next, 10);
        i++;
        break;
    }
  }

  return args;
}

export function hasWeighOptions(args: WeighArgs): boolean {
  return (
    args.keyLengthFactor !== undefined ||
    args.valueLengthFactor !== undefined ||
    args.sensitiveBonus !== undefined ||
    args.prefixDepthFactor !== undefined ||
    args.topN !== undefined
  );
}
