import * as fs from 'fs';
import * as path from 'path';

export interface EnvSnapshot {
  label: string;
  timestamp: string;
  source: string;
  data: Record<string, string>;
}

export function createSnapshot(
  label: string,
  source: string,
  data: Record<string, string>
): EnvSnapshot {
  return {
    label,
    timestamp: new Date().toISOString(),
    source,
    data,
  };
}

export function saveSnapshot(snapshot: EnvSnapshot, outputDir: string): string {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const safeName = snapshot.label.replace(/[^a-z0-9_-]/gi, '_');
  const filename = `${safeName}_${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return filepath;
}

export function loadSnapshot(filepath: string): EnvSnapshot {
  const raw = fs.readFileSync(filepath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!parsed.label || !parsed.timestamp || !parsed.data) {
    throw new Error(`Invalid snapshot file: ${filepath}`);
  }
  return parsed as EnvSnapshot;
}

export function listSnapshots(outputDir: string): string[] {
  if (!fs.existsSync(outputDir)) return [];
  return fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(outputDir, f))
    .sort();
}
