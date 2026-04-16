import { parseEnvContent,EnvFile } from './envParser';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

d', () => {
  it('parses basic key=value pairs', () => {
    const result = parseEnvContent('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comment lines', () => {
    const result = parseEnvContent('# comment\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('ignores empty lines', () => {
    const result = parseEnvContent('\nFOO=bar\n\n');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('strips double quotes from values', () => {
    const result = parseEnvContent('FOO="hello world"');
    expect(result).toEqual({ FOO: 'hello world' });
  });

  it('strips single quotes from values', () => {
    const result = parseEnvContent("FOO='hello world'");
    expect(result).toEqual({ FOO: 'hello world' });
  });

  it('handles values with equals signs', () => {
    const result = parseEnvContent('FOO=a=b=c');
    expect(result).toEqual({ FOO: 'a=b=c' });
  });

  it('handles empty values', () => {
    const result = parseEnvContent('FOO=');
    expect(result).toEqual({ FOO: '' });
  });

  it('skips lines without equals sign', () => {
    const result = parseEnvContent('INVALID_LINE\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });
});

describe('parseEnvFile', () => {
  it('reads and parses a real file', () => {
    const tmpFile = path.join(os.tmpdir(), 'test.env');
    fs.writeFileSync(tmpFile, 'APP_ENV=production\nPORT=3000');
    const result = parseEnvFile(tmpFile);
    expect(result).toEqual({ APP_ENV: 'production', PORT: '3000' });
    fs.unlinkSync(tmpFile);
  });

  it('throws if file does not exist', () => {
    expect(() => parseEnvFile('/nonexistent/.env')).toThrow('File not found');
  });
});
