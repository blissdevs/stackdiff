export interface ExpandArgs {
  inPlace: boolean;
  contextFile?: string;
  reportOnly: boolean;
  format: "text" | "json";
}

export function parseExpandArgs(argv: string[]): ExpandArgs {
  const args: ExpandArgs = {
    inPlace: false,
    contextFile: undefined,
    reportOnly: false,
    format: "text",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--in-place" || arg === "-i") {
      args.inPlace = true;
    } else if (arg === "--context" || arg === "-c") {
      args.contextFile = argv[++i];
    } else if (arg === "--report-only" || arg === "-r") {
      args.reportOnly = true;
    } else if (arg === "--format" || arg === "-f") {
      const fmt = argv[++i];
      if (fmt === "json" || fmt === "text") {
        args.format = fmt;
      }
    }
  }

  return args;
}

export function hasExpandOptions(args: ExpandArgs): boolean {
  return args.inPlace || args.reportOnly || args.contextFile !== undefined;
}
