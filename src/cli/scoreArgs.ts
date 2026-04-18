export interface ScoreArgs {
  penalizeMissing: boolean;
  penalizeEmpty: boolean;
  penalizeSensitiveExposed: boolean;
  bonusForPrefixConsistency: boolean;
  json: boolean;
}

export function parseScoreArgs(argv: string[]): ScoreArgs {
  return {
    penalizeMissing: !argv.includes("--no-penalize-missing"),
    penalizeEmpty: !argv.includes("--no-penalize-empty"),
    penalizeSensitiveExposed: !argv.includes("--no-penalize-sensitive"),
    bonusForPrefixConsistency: !argv.includes("--no-prefix-bonus"),
    json: argv.includes("--json"),
  };
}

export function hasScoreFlag(argv: string[]): boolean {
  return argv.includes("--score") || argv.includes("score");
}
