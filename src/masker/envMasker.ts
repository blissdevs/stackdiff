/**
 * envMasker.ts
 * Masks sensitive environment variable values for safe display.
 */

export interface MaskOptions {
  /** Patterns (substrings or regex) to identify sensitive keys */
  sensitivePatterns?: (string | RegExp)[];
  /** Replacement string for masked values */
  maskChar?: string;
  /** Number of characters to reveal at the end of the value */
  revealTail?: number;
}

const DEFAULT_SENSITIVE_PATTERNS: (string | RegExp)[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api_key/i,
  /private/i,
  /credential/i,
  /auth/i,
];

export function isSensitiveKey(
  key: string,
  patterns: (string | RegExp)[] = DEFAULT_SENSITIVE_PATTERNS
): boolean {
  return patterns.some((pattern) =>
    pattern instanceof RegExp ? pattern.test(key) : key.toLowerCase().includes(pattern.toLowerCase())
  );
}

export function maskValue(
  value: string,
  maskChar = '***',
  revealTail = 0
): string {
  if (value.length === 0) return '';
  if (revealTail <= 0) return maskChar;
  const tail = value.slice(-revealTail);
  return `${maskChar}${tail}`;
}

export function maskEnvMap(
  envMap: Record<string, string>,
  options: MaskOptions = {}
): Record<string, string> {
  const {
    sensitivePatterns = DEFAULT_SENSITIVE_PATTERNS,
    maskChar = '***',
    revealTail = 0,
  } = options;

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(envMap)) {
    result[key] = isSensitiveKey(key, sensitivePatterns)
      ? maskValue(value, maskChar, revealTail)
      : value;
  }
  return result;
}
