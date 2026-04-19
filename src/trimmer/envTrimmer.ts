export type TrimOptions = {
  trimKeys?: boolean;
  trimValues?: boolean;
  removeEmptyValues?: boolean;
  removeEmptyKeys?: boolean;
};

export type TrimReport = {
  original: Map<string, string>;
  trimmed: Map<string, string>;
  removedKeys: string[];
  modifiedKeys: string[];
};

export function trimKey(key: string): string {
  return key.trim();
}

export function trimValue(value: string): string {
  return value.trim();
}

export function trimEnvMap(
  env: Map<string, string>,
  options: TrimOptions = {}
): TrimReport {
  const {
    trimKeys = true,
    trimValues = true,
    removeEmptyValues = false,
    removeEmptyKeys = true,
  } = options;

  const trimmed = new Map<string, string>();
  const removedKeys: string[] = [];
  const modifiedKeys: string[] = [];

  for (const [rawKey, rawValue] of env.entries()) {
    const key = trimKeys ? trimKey(rawKey) : rawKey;
    const value = trimValues ? trimValue(rawValue) : rawValue;

    if (removeEmptyKeys && key === "") {
      removedKeys.push(rawKey);
      continue;
    }

    if (removeEmptyValues && value === "") {
      removedKeys.push(rawKey);
      continue;
    }

    if (key !== rawKey || value !== rawValue) {
      modifiedKeys.push(key || rawKey);
    }

    trimmed.set(key, value);
  }

  return { original: env, trimmed, removedKeys, modifiedKeys };
}

export function formatTrimReport(report: TrimReport): string {
  const lines: string[] = ["Trim Report", "==========="];
  if (report.modifiedKeys.length === 0 && report.removedKeys.length === 0) {
    lines.push("No changes.");
    return lines.join("\n");
  }
  if (report.modifiedKeys.length > 0) {
    lines.push(`Modified (${report.modifiedKeys.length}): ${report.modifiedKeys.join(", ")}`);
  }
  if (report.removedKeys.length > 0) {
    lines.push(`Removed (${report.removedKeys.length}): ${report.removedKeys.join(", ")}`);
  }
  return lines.join("\n");
}
