import { EncodingFormat } from "../encoder/envEncoder";

export interface EncodeArgs {
  format: EncodingFormat;
  keys: string[];
  decode: boolean;
}

const VALID_FORMATS: EncodingFormat[] = ["base64", "hex", "uri"];

export function parseEncodeArgs(argv: string[]): EncodeArgs {
  const args: EncodeArgs = { format: "base64", keys: [], decode: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === "--format" || arg === "-f") && argv[i + 1]) {
      const fmt = argv[++i] as EncodingFormat;
      if (VALID_FORMATS.includes(fmt)) args.format = fmt;
    } else if ((arg === "--key" || arg === "-k") && argv[i + 1]) {
      args.keys.push(argv[++i]);
    } else if (arg === "--decode" || arg === "-d") {
      args.decode = true;
    }
  }

  return args;
}

export function hasEncodeOptions(args: EncodeArgs): boolean {
  return args.keys.length > 0 || args.decode;
}
