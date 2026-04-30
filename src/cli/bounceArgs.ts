import { BounceRule } from "../bouncer/envBouncer";

export interface BounceArgs {
  rules: BounceRule[];
  strict: boolean;
  format: "text" | "json";
}

/**
 * Parses bounce rule strings of the form:
 *   KEY:allow=val1,val2
 *   KEY:block=val1,val2
 *   KEY:pattern=^\d+$
 */
function parseRuleString(raw: string): BounceRule | null {
  const colonIdx = raw.indexOf(":");
  if (colonIdx === -1) return null;
  const key = raw.slice(0, colonIdx).trim();
  const rest = raw.slice(colonIdx + 1).trim();

  if (rest.startsWith("allow=")) {
    return { key, allowedValues: rest.slice(6).split(",").map((v) => v.trim()) };
  }
  if (rest.startsWith("block=")) {
    return { key, blockedValues: rest.slice(6).split(",").map((v) => v.trim()) };
  }
  if (rest.startsWith("pattern=")) {
    try {
      return { key, pattern: new RegExp(rest.slice(8)) };
    } catch {
      return null;
    }
  }
  return null;
}

export function parseBounceArgs(argv: string[]): BounceArgs {
  const rules: BounceRule[] = [];
  let strict = false;
  let format: "text" | "json" = "text";

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--rule" && argv[i + 1]) {
      const rule = parseRuleString(argv[++i]);
      if (rule) rules.push(rule);
    } else if (argv[i] === "--strict") {
      strict = true;
    } else if (argv[i] === "--format" && argv[i + 1]) {
      const f = argv[++i];
      if (f === "json" || f === "text") format = f;
    }
  }

  return { rules, strict, format };
}

export function hasBounceOptions(args: BounceArgs): boolean {
  return args.rules.length > 0;
}
