export interface KeyPresence {
  key: string;
  sources: string[];
  missingFrom: string[];
}

export function trackKeyPresence(
  maps: Map<string, Map<string, string>>,
): KeyPresence[] {
  const allKeys = new Set<string>();
  for (const m of maps.values()) {
    for (const k of m.keys()) allKeys.add(k);
  }

  const sourceNames = Array.from(maps.keys());
  const result: KeyPresence[] = [];

  for (const key of allKeys) {
    const sources: string[] = [];
    const missingFrom: string[] = [];
    for (const name of sourceNames) {
      if (maps.get(name)?.has(key)) sources.push(name);
      else missingFrom.push(name);
    }
    result.push({ key, sources, missingFrom });
  }

  return result.sort((a, b) => a.key.localeCompare(b.key));
}

export function getMissingKeys(presence: KeyPresence[]): KeyPresence[] {
  return presence.filter((p) => p.missingFrom.length > 0);
}

export function formatKeyPresenceReport(presence: KeyPresence[]): string {
  const lines: string[] = ['Key Presence Report', '==================='];
  for (const p of presence) {
    const status = p.missingFrom.length === 0 ? '✓' : '✗';
    lines.push(`${status} ${p.key}`);
    if (p.missingFrom.length > 0) {
      lines.push(`  missing from: ${p.missingFrom.join(', ')}`);
    }
  }
  return lines.join('\n');
}
