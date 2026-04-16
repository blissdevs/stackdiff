import { LoadedEnv } from '../loader';
import { diffEnvMaps, hasDiff } from '../diff';
import { generateReport } from '../reporter';

export type ReportFormat = 'text' | 'json';

export interface PipelineOptions {
  format: ReportFormat;
  color: boolean;
}

export interface PipelineResult {
  output: string;
  hasDifferences: boolean;
}

export function runComparePipeline(
  base: LoadedEnv,
  compare: LoadedEnv,
  options: PipelineOptions
): PipelineResult {
  const diff = diffEnvMaps(base.map, compare.map);
  const output = generateReport(diff, base.name, compare.name, {
    format: options.format,
    color: options.color,
  });
  return {
    output,
    hasDifferences: hasDiff(diff),
  };
}

export function runMultiComparePipeline(
  base: LoadedEnv,
  targets: LoadedEnv[],
  options: PipelineOptions
): PipelineResult[] {
  return targets.map((target) => runComparePipeline(base, target, options));
}
