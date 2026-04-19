export interface DigestArgs {
  algorithm: "md5" | "sha1" | "sha256";
  label?: string;
  json: boolean;
}

export function parseDigestArgs(argv: string[]): DigestArgs {
  const args: DigestArgs = { algorithm: "sha256", json: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === "--algorithm" || arg === "-a") && argv[i + 1]) {
      const val = argv[++i];
      if (val === "md5" || val === "sha1" || val === "sha256") {
        args.algorithm = val;
      }
    } else if (arg === "--label" && argv[i + 1]) {
      args.label = argv[++i];
    } else if (arg === "--json") {
      args.json = true;
    }
  }

  return args;
}

export function hasDigestOptions(args: DigestArgs): boolean {
  return args.algorithm !== "sha256" || args.json || !!args.label;
}
