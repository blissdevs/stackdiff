export interface SquashArgs {
  preferLast: boolean;
  ignoreEmpty: boolean;
  keepKeys: string[];
  format: "text" | "json";
}

export function parseSquashArgs(argv: string[]): SquashArgs {
  const args: SquashArgs = {
    preferLast: true,
    ignoreEmpty: false,
    keepKeys: [],
    format: "text",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--prefer-first") {
      args.preferLast = false;
    } else if (arg === "--ignore-empty") {
      args.ignoreEmpty = true;
    } else if (arg === "--keep-keys" && argv[i + 1]) {
      args.keepKeys = argv[++i].split(",").map((k) => k.trim());
    } else if (arg === "--format" && argv[i + 1]) {
      const fmt = argv[++i];
      if (fmt === "json" || fmt === "text") {
        args.format = fmt;
      }
    }
  }

  return args;
}

export function hasSquashOptions(args: SquashArgs): boolean {
  return !args.preferLast || args.ignoreEmpty || args.keepKeys.length > 0;
}
