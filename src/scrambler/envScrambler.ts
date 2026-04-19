import { EnvMap } from '../parser/envParser';

export type ScramblerOptions = {
  keys?: string[];
  pattern?: RegExp;
  placeholder?: string;
};

const DEFAULT_PLACEHOLDER = '***SCRAMBLED***';

export function shouldScramble(
  key: string,
  options: ScramblerOptions
): boolean {
  if (options.keys && options.keys.includes(key)) return true;
  if (options.pattern && options.pattern.test(key)) return true;
  return false;
}

export function scrambleValue(
  value: string,
  placeholder: string = DEFAULT_PLACEHOLDER
): string {
  return placeholder;
}

export function scrambleEnvMap(
  envMap: EnvMap,
  options: ScramblerOptions = {}
): EnvMap {
  const result: EnvMap = new Map();
  const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;

  for (const [key, value] of envMap.entries()) {
    if (shouldScramble(key, options)) {
      result.set(key, scrambleValue(value, placeholder));
    } else {
      result.set(key, value);
    }
  }

  return result;
}

export function getScrambledKeys(
  envMap: EnvMap,
  options: ScramblerOptions = {}
): string[] {
  const scrambled: string[] = [];
  for (const key of envMap.keys()) {
    if (shouldScramble(key, options)) {
      scrambled.push(key);
    }
  }
  return scrambled;
}

export function formatScramblerReport(
  original: EnvMap,
  scrambled: EnvMap,
  options: ScramblerOptions = {}
): string {
  const keys = getScrambledKeys(original, options);
  const lines: string[] = [
    `Scrambler Report`,
    `----------------`,
    `Total keys: ${original.size}`,
    `Scrambled keys: ${keys.length}`,
    '',
    ...keys.map(k => `  [SCRAMBLED] ${k}`),
  ];
  return lines.join('\n');
}
