export type TransformFn = (key: string, value: string) => string;

export interface TransformOptions {
  keyPrefix?: string;
  keySuffix?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  keyCase?: 'upper' | 'lower' | 'none';
  custom?: TransformFn;
}

export function transformKey(key: string, opts: TransformOptions): string {
  let k = key;
  if (opts.keyCase === 'upper') k = k.toUpperCase();
  else if (opts.keyCase === 'lower') k = k.toLowerCase();
  if (opts.keyPrefix) k = opts.keyPrefix + k;
  if (opts.keySuffix) k = k + opts.keySuffix;
  return k;
}

export function transformValue(key: string, value: string, opts: TransformOptions): string {
  let v = value;
  if (opts.valuePrefix) v = opts.valuePrefix + v;
  if (opts.valueSuffix) v = v + opts.valueSuffix;
  if (opts.custom) v = opts.custom(key, v);
  return v;
}

export function transformEnvMap(
  env: Map<string, string>,
  opts: TransformOptions
): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of env.entries()) {
    const newKey = transformKey(key, opts);
    const newValue = transformValue(key, value, opts);
    result.set(newKey, newValue);
  }
  return result;
}
