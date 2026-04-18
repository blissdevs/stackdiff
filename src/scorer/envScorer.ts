export interface ScorerOptions {
  penalizeMissing?: boolean;
  penalizeEmpty?: boolean;
  penalizeSensitiveExposed?: boolean;
  bonusForPrefixConsistency?: boolean;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  percent: number;
  breakdown: Record<string, number>;
}

const SENSITIVE_PATTERNS = [/secret/i, /password/i, /token/i, /key/i, /auth/i];

function isSensitive(key: string): boolean {
  return SENSITIVE_PATTERNS.some((p) => p.test(key));
}

export function scoreEnvMap(
  env: Map<string, string>,
  options: ScorerOptions = {}
): ScoreResult {
  const {
    penalizeMissing = true,
    penalizeEmpty = true,
    penalizeSensitiveExposed = true,
    bonusForPrefixConsistency = true,
  } = options;

  const breakdown: Record<string, number> = {};
  let score = 100;
  const maxScore = 100;

  if (penalizeEmpty) {
    const emptyCount = [...env.values()].filter((v) => v.trim() === "").length;
    const penalty = emptyCount * 5;
    breakdown["emptyValues"] = -penalty;
    score -= penalty;
  }

  if (penalizeSensitiveExposed) {
    const exposed = [...env.entries()].filter(
      ([k, v]) => isSensitive(k) && v.length > 0 && !v.startsWith("*")
    ).length;
    const penalty = exposed * 10;
    breakdown["sensitiveExposed"] = -penalty;
    score -= penalty;
  }

  if (bonusForPrefixConsistency) {
    const keys = [...env.keys()];
    const prefixes = keys.map((k) => k.split("_")[0]);
    const prefixSet = new Set(prefixes);
    const bonus = prefixSet.size <= 3 ? 5 : 0;
    breakdown["prefixConsistency"] = bonus;
    score += bonus;
  }

  score = Math.max(0, Math.min(maxScore + 5, score));
  const percent = Math.round((score / maxScore) * 100);

  return { score, maxScore, percent, breakdown };
}

export function formatScoreReport(result: ScoreResult): string {
  const lines: string[] = [];
  lines.push(`Score: ${result.score}/${result.maxScore} (${result.percent}%)`);
  lines.push("Breakdown:");
  for (const [key, val] of Object.entries(result.breakdown)) {
    const sign = val >= 0 ? "+" : "";
    lines.push(`  ${key}: ${sign}${val}`);
  }
  return lines.join("\n");
}
