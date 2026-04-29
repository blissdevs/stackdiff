/**
 * envArchiver.ts
 * Archive and restore env maps with timestamps and metadata.
 * Useful for maintaining historical records of environment configurations.
 */

import * as fs from "fs";
import * as path from "path";

export interface EnvArchiveEntry {
  id: string;
  label: string;
  timestamp: string;
  source: string;
  env: Record<string, string>;
}

export interface ArchiveIndex {
  entries: Array<{ id: string; label: string; timestamp: string; source: string }>;
}

/**
 * Generate a unique archive ID based on timestamp.
 */
function generateArchiveId(): string {
  return `arch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Archive an env map with optional label and source metadata.
 */
export function archiveEnvMap(
  env: Record<string, string>,
  label: string,
  source: string = "unknown"
): EnvArchiveEntry {
  return {
    id: generateArchiveId(),
    label,
    timestamp: new Date().toISOString(),
    source,
    env: { ...env },
  };
}

/**
 * Save an archive entry to a directory as a JSON file.
 */
export function saveArchiveEntry(entry: EnvArchiveEntry, archiveDir: string): string {
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  const filePath = path.join(archiveDir, `${entry.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), "utf-8");
  return filePath;
}

/**
 * Load a specific archive entry by ID from the archive directory.
 */
export function loadArchiveEntry(id: string, archiveDir: string): EnvArchiveEntry | null {
  const filePath = path.join(archiveDir, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as EnvArchiveEntry;
}

/**
 * List all archive entries in a directory, sorted newest first.
 */
export function listArchiveEntries(archiveDir: string): EnvArchiveEntry[] {
  if (!fs.existsSync(archiveDir)) return [];
  const files = fs.readdirSync(archiveDir).filter((f) => f.endsWith(".json"));
  const entries: EnvArchiveEntry[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(archiveDir, file), "utf-8");
      entries.push(JSON.parse(raw) as EnvArchiveEntry);
    } catch {
      // skip malformed entries
    }
  }
  return entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Restore an env map from an archive entry by ID.
 * Returns null if the entry does not exist.
 */
export function restoreArchiveEntry(
  id: string,
  archiveDir: string
): Record<string, string> | null {
  const entry = loadArchiveEntry(id, archiveDir);
  return entry ? { ...entry.env } : null;
}

/**
 * Format a human-readable archive report.
 */
export function formatArchiveReport(entries: EnvArchiveEntry[]): string {
  if (entries.length === 0) return "No archive entries found.\n";
  const lines: string[] = ["Archive Entries:", ""];
  for (const entry of entries) {
    lines.push(`  [${entry.id}]`);
    lines.push(`    Label     : ${entry.label}`);
    lines.push(`    Source    : ${entry.source}`);
    lines.push(`    Timestamp : ${entry.timestamp}`);
    lines.push(`    Keys      : ${Object.keys(entry.env).length}`);
    lines.push("");
  }
  return lines.join("\n");
}
