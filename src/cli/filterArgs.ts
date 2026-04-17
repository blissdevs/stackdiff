/**
 * filterArgs.ts
 * Parse filter-related CLI flags and build FilterOptions.
 */

import type { FilterOptions } from '../filter/envFilter';

export interface RawFilterArgs {
  keys?: string;          // comma-separated key names
  pattern?: string;       // regex pattern for key inclusion
  excludeKeys?: string;   // comma-separated key names to exclude
  excludePattern?: string; // regex pattern for key exclusion
  search?: string;        // simple substring search
}

/**
 * Convert raw CLI string args into a structured FilterOptions object.
 */
export function parseFilterArgs(raw: RawFilterArgs): FilterOptions {
  const options: FilterOptions = {};

  if (raw.keys) {
    options.keys = raw.keys.split(',').map((k) => k.trim()).filter(Boolean);
  }

  if (raw.pattern) {
    options.pattern = raw.pattern;
  }

  if (raw.excludeKeys) {
    options.excludeKeys = raw.excludeKeys.split(',').map((k) => k.trim()).filter(Boolean);
  }

  if (raw.excludePattern) {
    options.excludePattern = raw.excludePattern;
  }

  return options;
}

/**
 * Returns true if any filter option is active.
 */
export function hasActiveFilter(options: FilterOptions & { search?: string }): boolean {
  return !!(
    (options.keys && options.keys.length > 0) ||
    options.pattern ||
    (options.excludeKeys && options.excludeKeys.length > 0) ||
    options.excludePattern ||
    (options as Record<string, unknown>).search
  );
}
