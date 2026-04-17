const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /private[_\-]?key/i,
  /api[_\-]?key/i,
  /auth/i,
  /credential/i,
  /passphrase/i,
];

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
}

export function maskValue(value: string, partial = false): string {
  if (partial && value.length >= 6) {
    const revealCount = Math.min(2, Math.floor(value.length / 4));
    const revealed = value.slice(0, revealCount);
    const masked = '*'.repeat(value.length - revealCount);
    return `${revealed}${masked}`;
  }
  return '***';
}

export interface MaskOptions {
  partial?: boolean;
  customKeys?: string[];
}

export function maskEnvMap(
  env: Map<string, string>,
  options: MaskOptions = {}
): Map<string, string> {
  const { partial = false, customKeys = [] } = options;
  const result = new Map<string, string>();

  for (const [key, value] of env.entries()) {
    const sensitive =
      isSensitiveKey(key) ||
      customKeys.some((k) => k.toLowerCase() === key.toLowerCase());

    result.set(key, sensitive ? maskValue(value, partial) : value);
  }

  return result;
}
