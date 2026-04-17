import { loadMultiple } from '../loader';
import { parseEnvContent } from '../parser';
import { diffEnvMaps, hasDiff } from '../diff';
import { filterEnvMap, searchEnvMap } from '../filter';
import { applySortOptions } from '../sorter';
import { maskEnvMap, MaskOptions } from '../masker';
import { generateReport } from '../reporter';
import type { EnvDiff } from '../diff/envDiffer';

export interface PipelineOptions {
  format?: 'text' | 'json';
  filter?: { prefixes?: string[]; keys?: string[]; search?: string };
  sort?: { alphabetical?: boolean; byPrefix?: boolean };
  mask?: MaskOptions & { enabled?: boolean };
}

export interface PipelineResult {
  diff: EnvDiff;
  report: string;
  hasChanges: boolean;
}

export async function runComparePipeline(
  sourceA: string,
  sourceB: string,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const [rawA, rawB] = await loadMultiple([sourceA, sourceB]);
  let mapA = parseEnvContent(rawA);
  let mapB = parseEnvContent(rawB);

  if (options.filter?.search) {
    mapA = searchEnvMap(mapA, options.filter.search);
    mapB = searchEnvMap(mapB, options.filter.search);
  }

  if (options.filter?.prefixes?.length || options.filter?.keys?.length) {
    mapA = filterEnvMap(mapA, options.filter);
    mapB = filterEnvMap(mapB, options.filter);
  }

  if (options.sort) {
    mapA = applySortOptions(mapA, options.sort);
    mapB = applySortOptions(mapB, options.sort);
  }

  if (options.mask?.enabled) {
    mapA = maskEnvMap(mapA, options.mask);
    mapB = maskEnvMap(mapB, options.mask);
  }

  const diff = diffEnvMaps(mapA, mapB);
  const report = generateReport(diff, { format: options.format ?? 'text' });

  return { diff, report, hasChanges: hasDiff(diff) };
}

export async function runMultiComparePipeline(
  sources: string[],
  options: PipelineOptions = {}
): Promise<PipelineResult[]> {
  const results: PipelineResult[] = [];
  for (let i = 0; i < sources.length - 1; i++) {
    results.push(await runComparePipeline(sources[i], sources[i + 1], options));
  }
  return results;
}
