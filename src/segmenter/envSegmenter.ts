/**
 * envSegmenter: split an env map into named segments based on key patterns or value types.
 */

export type Segment = {
  name: string;
  keys: Map<string, string>;
};

export type SegmentRule = {
  name: string;
  match: (key: string, value: string) => boolean;
};

/**
 * Segment an env map by applying a list of rules in order.
 * Keys not matched by any rule go into a "default" segment.
 */
export function segmentEnvMap(
  env: Map<string, string>,
  rules: SegmentRule[]
): Segment[] {
  const buckets = new Map<string, Map<string, string>>();

  for (const rule of rules) {
    buckets.set(rule.name, new Map());
  }
  buckets.set("default", new Map());

  for (const [key, value] of env) {
    let matched = false;
    for (const rule of rules) {
      if (rule.match(key, value)) {
        buckets.get(rule.name)!.set(key, value);
        matched = true;
        break;
      }
    }
    if (!matched) {
      buckets.get("default")!.set(key, value);
    }
  }

  const segments: Segment[] = [];
  for (const [name, keys] of buckets) {
    if (keys.size > 0 || name !== "default") {
      segments.push({ name, keys });
    }
  }
  return segments;
}

/**
 * Look up a specific segment by name.
 */
export function getSegment(
  segments: Segment[],
  name: string
): Segment | undefined {
  return segments.find((s) => s.name === name);
}

/**
 * Format a human-readable report of segments.
 */
export function formatSegmentReport(segments: Segment[]): string {
  const lines: string[] = ["=== Segment Report ==="];
  for (const seg of segments) {
    lines.push(`\n[${seg.name}] (${seg.keys.size} key${seg.keys.size !== 1 ? "s" : ""})`);
    for (const [k, v] of seg.keys) {
      lines.push(`  ${k}=${v}`);
    }
  }
  return lines.join("\n");
}
