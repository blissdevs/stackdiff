/**
 * Splitter module for dividing environment variable maps into logical groups.
 * Provides utilities for splitting, filtering, and reporting on env var collections.
 */
export { splitEnvMap, splitByPredicate, splitByPrefix, formatSplitReport } from "./envSplitter";
export type { SplitResult } from "./envSplitter";
