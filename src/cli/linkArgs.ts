/**
 * linkArgs.ts
 * CLI argument parsing for the --link feature.
 */

export interface LinkArgs {
  source: string | undefined;
  maps: Record<string, string>; // name => file path
  apply: boolean;
  output: "text" | "json";
}

/**
 * Parses --link-map name=path pairs from argv.
 * Example: --link-map prod=.env.prod --link-map staging=.env.staging
 */
export function parseLinkArgs(argv: string[]): LinkArgs {
  const maps: Record<string, string> = {};
  let source: string | undefined;
  let apply = false;
  let output: "text" | "json" = "text";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--link-source" && argv[i + 1]) {
      source = argv[++i];
    } else if (arg === "--link-map" && argv[i + 1]) {
      const pair = argv[++i];
      const eqIdx = pair.indexOf("=");
      if (eqIdx > 0) {
        const name = pair.slice(0, eqIdx);
        const path = pair.slice(eqIdx + 1);
        maps[name] = path;
      }
    } else if (arg === "--link-apply") {
      apply = true;
    } else if (arg === "--link-output" && argv[i + 1]) {
      const val = argv[++i];
      if (val === "json" || val === "text") output = val;
    }
  }

  return { source, maps, apply, output };
}

export function hasLinkOptions(args: LinkArgs): boolean {
  return !!args.source || Object.keys(args.maps).length > 0;
}
