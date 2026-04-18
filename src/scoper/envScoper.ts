/**
 * envScoper: extract or restrict env maps to a named scope/namespace prefix.
 */

export interface ScopeOptions {
  prefix: string;
  stripPrefix?: boolean;
}

/**
 * Extract keys that belong to a scope (prefix), optionally stripping the prefix.
 */
export function scopeEnvMap(
  env: Map<string, string>,
  options: ScopeOptions
): Map<string, string> {
  const { prefix, stripPrefix = false } = options;
  const upper = prefix.toUpperCase();
  const result = new Map<string, string>();

  for (const [key, value] of env) {
    if (key.toUpperCase().startsWith(upper)) {
      const newKey = stripPrefix ? key.slice(prefix.length) : key;
      result.set(newKey, value);
    }
  }

  return result;
}

/**
 * List distinct scope prefixes found in an env map, using a separator.
 */
export function listScopes(
  env: Map<string, string>,
  separator = "_"
): string[] {
  const scopes = new Set<string>();
  for (const key of env.keys()) {
    const idx = key.indexOf(separator);
    if (idx > 0) {
      scopes.add(key.slice(0, idx));
    }
  }
  return Array.from(scopes).sort();
}

/**
 * Inject a scope prefix onto all keys in an env map.
 */
export function injectScope(
  env: Map<string, string>,
  prefix: string
): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of env) {
    result.set(`${prefix}${key}`, value);
  }
  return result;
}
