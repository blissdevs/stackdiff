import * as fs from 'fs';
import * as path from 'path';

export interface EnvMap {
  [key: string]: string;
}

export function parseEnvFile(filePath: string): EnvMap {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  return parseEnvContent(content);
}

export function parseEnvContent(content: string): EnvMap {
  const result: EnvMap = {};

  const lines = content.split('\n');

  for (const raw of lines) {
    const line = raw.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      continue;
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith"'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}
