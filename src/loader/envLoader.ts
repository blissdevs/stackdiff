import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile, parseEnvContent } from '../parser';

export type EnvSource =
  | { type: 'file'; path: string }
  | { type: 'inline'; name: string; content: string };

export interface LoadedEnv {
  name: string;
  map: Record<string, string>;
  source: EnvSource;
}

export function loadFromFile(filePath: string): LoadedEnv {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  const map = parseEnvFile(resolved);
  return {
    name: path.basename(filePath),
    map,
    source: { type: 'file', path: resolved },
  };
}

export function loadFromInline(name: string, content: string): LoadedEnv {
  const map = parseEnvContent(content);
  return {
    name,
    map,
    source: { type: 'inline', name, content },
  };
}

export function loadMultiple(sources: EnvSource[]): LoadedEnv[] {
  return sources.map((source) => {
    if (source.type === 'file') {
      return loadFromFile(source.path);
    }
    return loadFromInline(source.name, source.content);
  });
}
