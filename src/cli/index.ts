#!/usr/bin/env node
import { parseCliArgs } from './cliArgs';
import { loadMultiple, loadFromInline } from '../loader';
import { runComparePipeline, runMultiComparePipeline } from '../pipeline/comparePipeline';

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));

  try {
    if (args.inline && args.inline.length >= 2) {
      const maps = args.inline.map((raw) => loadFromInline(raw));
      if (maps.length === 2) {
        const result = runComparePipeline(maps[0], maps[1], {
          format: args.format,
          outputFile: args.output,
        });
        if (result.hasDiff) process.exit(1);
      } else {
        const result = runMultiComparePipeline(maps, {
          format: args.format,
          outputFile: args.output,
        });
        if (result.some((r) => r.hasDiff)) process.exit(1);
      }
      return;
    }

    if (!args.files || args.files.length < 2) {
      console.error('Error: at least two --file arguments are required.');
      process.exit(2);
    }

    const maps = await loadMultiple(args.files);

    if (maps.length === 2) {
      const result = runComparePipeline(maps[0], maps[1], {
        format: args.format,
        outputFile: args.output,
      });
      if (result.hasDiff) process.exit(1);
    } else {
      const result = runMultiComparePipeline(maps, {
        format: args.format,
        outputFile: args.output,
      });
      if (result.some((r) => r.hasDiff)) process.exit(1);
    }
  } catch (err) {
    console.error('Fatal:', (err as Error).message);
    process.exit(2);
  }
}

main();
