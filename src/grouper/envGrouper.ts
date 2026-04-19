export type EnvGroup = {
  name: string;
  keys: string[];
  entries: Record<string, string>;
};

export function groupByPrefix(
  env: Map<string, string>,
  delimiter = "_"
): Map<string, EnvGroup> {
  const groups = new Map<string, EnvGroup>();

  for (const [key, value] of env.entries()) {
    const idx = key.indexOf(delimiter);
    const prefix = idx !== -1 ? key.slice(0, idx) : "__ungrouped__";

    if (!groups.has(prefix)) {
      groups.set(prefix, { name: prefix, keys: [], entries: {} });
    }

    const group = groups.get(prefix)!;
    group.keys.push(key);
    group.entries[key] = value;
  }

  return groups;
}

export function getGroup(
  groups: Map<string, EnvGroup>,
  name: string
): EnvGroup | undefined {
  return groups.get(name);
}

export function listGroupNames(groups: Map<string, EnvGroup>): string[] {
  return Array.from(groups.keys()).sort();
}

export function formatGroupReport(groups: Map<string, EnvGroup>): string {
  const lines: string[] = [];

  for (const name of listGroupNames(groups)) {
    const group = groups.get(name)!;
    lines.push(`[${name}] (${group.keys.length} keys)`);
    for (const key of group.keys.sort()) {
      lines.push(`  ${key}=${group.entries[key]}`);
    }
  }

  return lines.join("\n");
}

export function flattenGroup(group: EnvGroup): Map<string, string> {
  return new Map(Object.entries(group.entries));
}
