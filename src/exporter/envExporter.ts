import * as fs from 'fs';
import * as path from 'path';

export type ExportFormat = 'env' | 'json' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
  includeEmpty?: boolean;
}

export function exportToEnv(envMap: Record<string, string>): string {
  return Object.entries(envMap)
    .map(([key, value]) => {
      const needsQuotes = /\s|#|"/.test(value);
      return needsQuotes ? `${key}="${value.replace(/"/g, '\\"')}"` : `${key}=${value}`;
    })
    .join('\n');
}

export function exportToJson(envMap: Record<string, string>): string {
  return JSON.stringify(envMap, null, 2);
}

export function exportToCsv(envMap: Record<string, string>): string {
  const header = 'key,value';
  const rows = Object.entries(envMap).map(([key, value]) => {
    const escapedValue = value.includes(',') || value.includes('"')
      ? `"${value.replace(/"/g, '""')}"`
      : value;
    return `${key},${escapedValue}`;
  });
  return [header, ...rows].join('\n');
}

export function exportEnvMap(
  envMap: Record<string, string>,
  options: ExportOptions
): string {
  const { format, includeEmpty = true } = options;

  const filtered = includeEmpty
    ? envMap
    : Object.fromEntries(Object.entries(envMap).filter(([, v]) => v !== ''));

  switch (format) {
    case 'env':
      return exportToEnv(filtered);
    case 'json':
      return exportToJson(filtered);
    case 'csv':
      return exportToCsv(filtered);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function writeExport(
  content: string,
  outputPath: string
): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, content, 'utf-8');
}
