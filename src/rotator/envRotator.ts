import { EnvMap } from "../parser/envParser";

export interface RotateOptions {
  keys?: string[];
  generator?: (key: string, oldValue: string) => string;
  dryRun?: boolean;
}

export interface RotateResult {
  key: string;
  oldValue: string;
  newValue: string;
  rotated: boolean;
}

function defaultGenerator(_key: string, _oldValue: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export function rotateEnvMap(
  env: EnvMap,
  options: RotateOptions = {}
): { rotated: EnvMap; results: RotateResult[] } {
  const { keys, generator = defaultGenerator, dryRun = false } = options;
  const rotated: EnvMap = new Map(env);
  const results: RotateResult[] = [];

  for (const [key, oldValue] of env.entries()) {
    const shouldRotate = !keys || keys.includes(key);
    if (!shouldRotate) {
      results.push({ key, oldValue, newValue: oldValue, rotated: false });
      continue;
    }
    const newValue = generator(key, oldValue);
    if (!dryRun) {
      rotated.set(key, newValue);
    }
    results.push({ key, oldValue, newValue, rotated: !dryRun });
  }

  return { rotated, results };
}

export function formatRotateReport(results: RotateResult[]): string {
  const rotatedKeys = results.filter((r) => r.rotated);
  const skippedKeys = results.filter((r) => !r.rotated);
  const lines: string[] = [
    `Rotation Report`,
    `  Rotated : ${rotatedKeys.length}`,
    `  Skipped : ${skippedKeys.length}`,
    "",
  ];
  for (const r of rotatedKeys) {
    lines.push(`  [rotated] ${r.key}`);
  }
  for (const r of skippedKeys) {
    lines.push(`  [skipped] ${r.key}`);
  }
  return lines.join("\n");
}

export function rotateResultsToJson(results: RotateResult[]): string {
  return JSON.stringify(
    results.map(({ key, rotated }) => ({ key, rotated })),
    null,
    2
  );
}
