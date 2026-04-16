import { parseCliArgs, CliOptions } from './cliArgs';

describe('parseCliArgs', () => {
  it('parses file paths', () => {
    const opts = parseCliArgs(['node', 'stackdiff', '--files', '.env.dev', '.env.prod']);
    expect(opts.files).toEqual(['.env.dev', '.env.prod']);
  });

  it('defaults format to text', () => {
    const opts = parseCliArgs(['node', 'stackdiff', '--files', '.env.dev']);
    expect(opts.format).toBe('text');
  });

  it('parses json format', () => {
    const opts = parseCliArgs(['node', 'stackdiff', '--files', '.env.dev', '--format', 'json']);
    expect(opts.format).toBe('json');
  });

  it('parses inline pairs', () => {
    const opts = parseCliArgs(['node', 'stackdiff', '--inline', 'KEY=val']);
    expect(opts.inline).toEqual(['KEY=val']);
  });

  it('defaults strict to false', () => {
    const opts = parseCliArgs(['node', 'stackdiff', '--files', '.env.dev']);
    expect(opts.strict).toBe(false);
  });

  it('parses strict flag', () => {
    const opts = parseCliArgs(['node', 'stackdiff', '--files', '.env.dev', '--strict']);
    expect(opts.strict).toBe(true);
  });

  it('parses specific keys filter', () => {
    const opts = parseCliArgs(['node', 'stackdiff', '--files', '.env.dev', '--keys', 'DB_URL', 'PORT']);
    expect(opts.keys).toEqual(['DB_URL', 'PORT']);
  });

  it('keys is undefined when not provided', () => {
    const opts = parseCliArgs(['node', 'stackdiff', '--files', '.env.dev']);
    expect(opts.keys).toBeUndefined();
  });
});
