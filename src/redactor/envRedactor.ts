import { EnvMap } from '../loader/envLoader';

export interface RedactOptions {
  placeholder?: string;
  keys?: string[];
  patterns?: RegExp[];
}

const DEFAULT_PLACEHOLDER = '[REDACTED]';

const DEFAULT_PATTERNS: RegExp[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

export function shouldRedact(key: string, options: RedactOptions = {}): boolean {
  const { keys = [], patterns = DEFAULT_PATTERNS } = options;
  if (keys.includes(key)) return true;
  return patterns.some((p) => p.test(key));
}

export function redactValue(value: string, placeholder: string = DEFAULT_PLACEHOLDER): string {
  return placeholder;
}

export function redactEnvMap(map: EnvMap, options: RedactOptions = {}): EnvMap {
  const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;
  const result: EnvMap = new Map();
  for (const [key, value] of map.entries()) {
    result.set(key, shouldRedact(key, options) ? redactValue(value, placeholder) : value);
  }
  return result;
}

export function getRedactedKeys(map: EnvMap, options: RedactOptions = {}): string[] {
  return Array.from(map.keys()).filter((key) => shouldRedact(key, options));
}
