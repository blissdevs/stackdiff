/**
 * envLinker.ts
 * Links environment variables across multiple maps by resolving cross-references.
 */

export type EnvMap = Map<string, string>;

export interface LinkResult {
  key: string;
  sourceMap: string;
  targetMap: string;
  targetKey: string;
  resolvedValue: string | undefined;
}

export interface LinkReport {
  links: LinkResult[];
  unresolved: string[];
  total: number;
}

/**
 * Parses a link directive like "@mapName.KEY" from a value.
 */
export function parseLinkDirective(value: string): { mapName: string; key: string } | null {
  const match = value.match(/^@([\w-]+)\.([\w_]+)$/);
  if (!match) return null;
  return { mapName: match[1], key: match[2] };
}

/**
 * Resolves cross-map references in a source map against named target maps.
 */
export function linkEnvMaps(
  sourceMap: EnvMap,
  sourceName: string,
  namedMaps: Record<string, EnvMap>
): LinkReport {
  const links: LinkResult[] = [];
  const unresolved: string[] = [];

  for (const [key, value] of sourceMap.entries()) {
    const directive = parseLinkDirective(value);
    if (!directive) continue;

    const targetMap = namedMaps[directive.mapName];
    const resolvedValue = targetMap?.get(directive.key);

    links.push({
      key,
      sourceMap: sourceName,
      targetMap: directive.mapName,
      targetKey: directive.key,
      resolvedValue,
    });

    if (resolvedValue === undefined) {
      unresolved.push(key);
    }
  }

  return { links, unresolved, total: links.length };
}

/**
 * Applies resolved links back into the source map, replacing directives with values.
 */
export function applyLinks(sourceMap: EnvMap, report: LinkReport): EnvMap {
  const result = new Map(sourceMap);
  for (const link of report.links) {
    if (link.resolvedValue !== undefined) {
      result.set(link.key, link.resolvedValue);
    }
  }
  return result;
}

/**
 * Formats a human-readable link report.
 */
export function formatLinkReport(report: LinkReport): string {
  const lines: string[] = [`Link Report (${report.total} link(s) found):`];
  for (const link of report.links) {
    const status = link.resolvedValue !== undefined ? `=> "${link.resolvedValue}"` : "=> UNRESOLVED";
    lines.push(`  ${link.key} [${link.sourceMap}] -> ${link.targetMap}.${link.targetKey} ${status}`);
  }
  if (report.unresolved.length > 0) {
    lines.push(`\nUnresolved (${report.unresolved.length}): ${report.unresolved.join(", ")}`);
  }
  return lines.join("\n");
}
