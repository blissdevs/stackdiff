export type AliasMap = Record<string, string>;

/**
 * Apply aliases to an env map: for each alias -> canonical mapping,
 * copy the canonical key's value to the alias key (if canonical exists).
 */
export function applyAliases(
  env: Map<string, string>,
  aliases: AliasMap
): Map<string, string> {
  const result = new Map(env);
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (env.has(canonical)) {
      result.set(alias, env.get(canonical)!);
    }
  }
  return result;
}

/**
 * Resolve aliases in reverse: given an alias key, return the canonical key name.
 */
export function resolveAlias(key: string, aliases: AliasMap): string {
  return aliases[key] ?? key;
}

/**
 * Build an alias map from an array of "alias=canonical" strings.
 */
export function buildAliasMap(entries: string[]): AliasMap {
  const map: AliasMap = {};
  for (const entry of entries) {
    const eq = entry.indexOf('=');
    if (eq === -1) continue;
    const alias = entry.slice(0, eq).trim();
    const canonical = entry.slice(eq + 1).trim();
    if (alias && canonical) map[alias] = canonical;
  }
  return map;
}

/**
 * Format a human-readable alias report.
 */
export function formatAliasReport(
  env: Map<string, string>,
  aliases: AliasMap
): string {
  const lines: string[] = ['Alias Report:', ''];
  for (const [alias, canonical] of Object.entries(aliases)) {
    const resolved = env.has(canonical) ? env.get(canonical) : '<missing>';
    lines.push(`  ${alias} -> ${canonical}: ${resolved}`);
  }
  return lines.join('\n');
}
