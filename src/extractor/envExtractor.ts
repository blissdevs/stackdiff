import { EnvMap } from '../parser/envParser';

export interface ExtractOptions {
  keys?: string[];
  pattern?: RegExp;
  prefix?: string;
  stripPrefix?: boolean;
}

export interface ExtractResult {
  extracted: EnvMap;
  skipped: string[];
  totalInput: number;
}

export function extractEnvMap(env: EnvMap, options: ExtractOptions): ExtractResult {
  const extracted: EnvMap = new Map();
  const skipped: string[] = [];

  for (const [key, value] of env.entries()) {
    let match = false;
    let outputKey = key;

    if (options.keys && options.keys.length > 0) {
      match = options.keys.includes(key);
    } else if (options.pattern) {
      match = options.pattern.test(key);
    } else if (options.prefix) {
      match = key.startsWith(options.prefix);
      if (match && options.stripPrefix) {
        outputKey = key.slice(options.prefix.length);
      }
    } else {
      match = true;
    }

    if (match) {
      extracted.set(outputKey, value);
    } else {
      skipped.push(key);
    }
  }

  return { extracted, skipped, totalInput: env.size };
}

export function formatExtractReport(result: ExtractResult): string {
  const lines: string[] = [
    `Extract Report`,
    `  Input keys  : ${result.totalInput}`,
    `  Extracted   : ${result.extracted.size}`,
    `  Skipped     : ${result.skipped.length}`,
  ];

  if (result.extracted.size > 0) {
    lines.push('  Keys:');
    for (const key of result.extracted.keys()) {
      lines.push(`    - ${key}`);
    }
  }

  return lines.join('\n');
}

export function extractResultToJson(result: ExtractResult): object {
  return {
    totalInput: result.totalInput,
    extractedCount: result.extracted.size,
    skippedCount: result.skipped.length,
    extracted: Object.fromEntries(result.extracted),
    skipped: result.skipped,
  };
}
