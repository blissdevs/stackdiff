export interface RotateArgs {
  keys: string[];
  dryRun: boolean;
  format: "text" | "json";
  output?: string;
}

export function parseRotateArgs(argv: string[]): RotateArgs {
  const args: RotateArgs = {
    keys: [],
    dryRun: false,
    format: "text",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === "--key" || arg === "-k") && argv[i + 1]) {
      args.keys.push(...argv[++i].split(",").map((k) => k.trim()));
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--format" && argv[i + 1]) {
      const fmt = argv[++i];
      if (fmt === "json" || fmt === "text") {
        args.format = fmt;
      }
    } else if (arg === "--output" && argv[i + 1]) {
      args.output = argv[++i];
    }
  }

  return args;
}

export function hasRotateOptions(args: RotateArgs): boolean {
  return args.keys.length > 0 || args.dryRun;
}
