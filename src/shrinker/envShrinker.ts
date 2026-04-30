/**
 * envShrinker: removes keys with empty, null, or placeholder values from an env map
 */

export type ShrinkOptions = {
  removeEmpty?: boolean;
  removePlaceholders?: boolean;
  customPlaceholders?: string[];
};

export type ShrinkResult = {
  shrunk: Map<string, string>;
  removed: Map<string, string>;
  removedKeys: string[];
};

const DEFAULT_PLACEHOLDERS = [
  "CHANGEME",
  "TODO",
  "PLACEHOLDER",
  "<your-value>",
  "<change-me>",
  "YOUR_VALUE_HERE",
  "FIXME",
];

export function isPlaceholder(value: string, extras: string[] = []): boolean {
  const all = [...DEFAULT_PLACEHOLDERS, ...extras];
  return all.some((p) => value.trim().toUpperCase() === p.toUpperCase());
}

export function shrinkEnvMap(
  env: Map<string, string>,
  options: ShrinkOptions = {}
): ShrinkResult {
  const {
    removeEmpty = true,
    removePlaceholders = true,
    customPlaceholders = [],
  } = options;

  const shrunk = new Map<string, string>();
  const removed = new Map<string, string>();

  for (const [key, value] of env) {
    let shouldRemove = false;

    if (removeEmpty && value.trim() === "") {
      shouldRemove = true;
    } else if (removePlaceholders && isPlaceholder(value, customPlaceholders)) {
      shouldRemove = true;
    }

    if (shouldRemove) {
      removed.set(key, value);
    } else {
      shrunk.set(key, value);
    }
  }

  return { shrunk, removed, removedKeys: Array.from(removed.keys()) };
}

export function formatShrinkReport(result: ShrinkResult): string {
  const lines: string[] = [];
  lines.push(`Shrink Report`);
  lines.push(`  Retained : ${result.shrunk.size}`);
  lines.push(`  Removed  : ${result.removed.size}`);
  if (result.removedKeys.length > 0) {
    lines.push(`  Removed keys:`);
    for (const key of result.removedKeys) {
      const val = result.removed.get(key) ?? "";
      const reason = val.trim() === "" ? "empty" : "placeholder";
      lines.push(`    - ${key} (${reason})`);
    }
  }
  return lines.join("\n");
}
