import { FormatStyle, FormatOptions } from "../formatter/envFormatter";

const VALID_STYLES: FormatStyle[] = ["dotenv", "export", "json", "yaml", "table"];

export interface FormatArgs {
  style: FormatStyle;
  indent: number;
  includeComments: boolean;
  output?: string;
}

export function parseFormatArgs(argv: string[]): FormatArgs {
  const args: FormatArgs = {
    style: "dotenv",
    indent: 2,
    includeComments: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === "--style" || arg === "-s") && argv[i + 1]) {
      const candidate = argv[++i] as FormatStyle;
      if (VALID_STYLES.includes(candidate)) args.style = candidate;
      else throw new Error(`Unknown format style: ${candidate}. Valid: ${VALID_STYLES.join(", ")}`);
    } else if (arg === "--indent" && argv[i + 1]) {
      const n = parseInt(argv[++i], 10);
      if (!isNaN(n) && n >= 0) args.indent = n;
    } else if (arg === "--comments" || arg === "-c") {
      args.includeComments = true;
    } else if ((arg === "--output" || arg === "-o") && argv[i + 1]) {
      args.output = argv[++i];
    }
  }

  return args;
}

export function hasFormatOptions(args: FormatArgs): boolean {
  return args.style !== "dotenv" || args.includeComments || args.output !== undefined;
}

export function formatArgsToOptions(args: FormatArgs): FormatOptions {
  return {
    style: args.style,
    indent: args.indent,
    includeComments: args.includeComments,
  };
}
