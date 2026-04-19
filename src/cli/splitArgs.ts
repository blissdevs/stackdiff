export interface SplitArgs {
  chunkSize?: number;
  prefixes?: string[];
  mode: "chunk" | "prefix" | "predicate";
}

export function parseSplitArgs(argv: string[]): SplitArgs {
  const args: SplitArgs = { mode: "chunk" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === "--chunk-size" || arg === "-n") && argv[i + 1]) {
      args.chunkSize = parseInt(argv[++i], 10);
      args.mode = "chunk";
    } else if (arg === "--prefix" && argv[i + 1]) {
      args.prefixes = argv[++i].split(",").map((p) => p.trim());
      args.mode = "prefix";
    } else if (arg === "--by-prefix") {
      args.mode = "prefix";
    }
  }
  return args;
}

export function hasSplitOptions(args: SplitArgs): boolean {
  return args.mode === "prefix"
    ? Array.isArray(args.prefixes) && args.prefixes.length > 0
    : typeof args.chunkSize === "number" && args.chunkSize > 0;
}
