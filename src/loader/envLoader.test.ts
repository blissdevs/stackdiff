import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { loadFromFile, loadFromInline, loadMultiple } from './envLoader';

function writeTempEnv(content: string): string {
  const tmpFile = path.join(os.tmpdir(), `stackdiff-test-${Date.now()}.env`);
  fs.writeFileSync(tmpFile, content, 'utf-8');
  return tmpFile;
}

describe('loadFromFile', () => {
  it('loads and parses a valid .env file', () => {
    const tmpFile = writeTempEnv('FOO=bar\nBAZ=qux\n');
    const result = loadFromFile(tmpFile);
    expect(result.map).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(result.source.type).toBe('file');
    fs.unlinkSync(tmpFile);
  });

  it('throws if file does not exist', () => {
    expect(() => loadFromFile('/nonexistent/.env')).toThrow('File not found');
  });

  it('uses basename as name', () => {
    const tmpFile = writeTempEnv('A=1');
    const result = loadFromFile(tmpFile);
    expect(result.name).toBe(path.basename(tmpFile));
    fs.unlinkSync(tmpFile);
  });

  it('handles values with equals signs', () => {
    const tmpFile = writeTempEnv('URL=http://example.com?a=1&b=2\n');
    const result = loadFromFile(tmpFile);
    expect(result.map).toEqual({ URL: 'http://example.com?a=1&b=2' });
    fs.unlinkSync(tmpFile);
  });
});

describe('loadFromInline', () => {
  it('parses inline content', () => {
    const result = loadFromInline('staging', 'HOST=localhost\nPORT=3000');
    expect(result.map).toEqual({ HOST: 'localhost', PORT: '3000' });
    expect(result.name).toBe('staging');
    expect(result.source.type).toBe('inline');
  });
});

describe('loadMultiple', () => {
  it('loads multiple sources', () => {
    const tmpFile = writeTempEnv('X=1');
    const results = loadMultiple([
      { type: 'file', path: tmpFile },
      { type: 'inline', name: 'env2', content: 'Y=2' },
    ]);
    expect(results).toHaveLength(2);
    expect(results[0].map).toEqual({ X: '1' });
    expect(results[1].map).toEqual({ Y: '2' });
    fs.unlinkSync(tmpFile);
  });
});
