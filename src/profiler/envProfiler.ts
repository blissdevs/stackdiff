export interface EnvProfile {
  name: string;
  description?: string;
  keys: string[];
  createdAt: string;
}

export interface ProfileMatchResult {
  profile: EnvProfile;
  matched: string[];
  missing: string[];
  extra: string[];
  score: number;
}

export function createProfile(
  name: string,
  keys: string[],
  description?: string
): EnvProfile {
  return {
    name,
    description,
    keys: [...new Set(keys)],
    createdAt: new Date().toISOString(),
  };
}

export function matchProfile(
  envMap: Map<string, string>,
  profile: EnvProfile
): ProfileMatchResult {
  const envKeys = Array.from(envMap.keys());
  const matched = profile.keys.filter((k) => envMap.has(k));
  const missing = profile.keys.filter((k) => !envMap.has(k));
  const extra = envKeys.filter((k) => !profile.keys.includes(k));
  const score =
    profile.keys.length === 0
      ? 1
      : matched.length / profile.keys.length;

  return { profile, matched, missing, extra, score };
}

export function formatProfileReport(result: ProfileMatchResult): string {
  const lines: string[] = [];
  lines.push(`Profile: ${result.profile.name}`);
  if (result.profile.description) {
    lines.push(`Description: ${result.profile.description}`);
  }
  lines.push(`Match score: ${(result.score * 100).toFixed(1)}%`);
  lines.push(`Matched (${result.matched.length}): ${result.matched.join(', ') || 'none'}`);
  lines.push(`Missing (${result.missing.length}): ${result.missing.join(', ') || 'none'}`);
  lines.push(`Extra (${result.extra.length}): ${result.extra.join(', ') || 'none'}`);
  return lines.join('\n');
}
