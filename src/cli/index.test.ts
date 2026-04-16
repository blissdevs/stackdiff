import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const CLI = path.resolve(__dirname, '../../dist/cli/index.js');
const execOpts: ExecSyncOptionsWithStringEncoding = { encoding: 'utf8', stdio: 'pipe' };

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `stackdiff-cli-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(file, content);
  return file;
}

describe('CLI integration', () => {
  let fileA: string;
  let fileB: string;

  beforeAll(() => {
    fileA = writeTempEnv('KEY_A=1\nSHARED=hello\n');
    fileB = writeTempEnv('KEY_B=2\nSHARED=hello\n');
  });

  afterAll(() => {
    fs.unlinkSync(fileA);
    fs.unlinkSync(fileB);
  });

  it('exits with code 1 when there are differences', () => {
    try {
      execSync(`node ${CLI} --file ${fileA} --file ${fileB}`, execOpts);
      fail('expected non-zero exit');
    } catch (err: any) {
      expect(err.status).toBe(1);
    }
  });

  it('exits with code 0 when files are identical', () => {
    const fileC = writeTempEnv('KEY_A=1\nSHARED=hello\n');
    try {
      const out = execSync(`node ${CLI} --file ${fileA} --file ${fileC}`, execOpts);
      expect(out).toBeDefined();
    } finally {
      fs.unlinkSync(fileC);
    }
  });

  it('exits with code 2 when fewer than two files provided', () => {
    try {
      execSync(`node ${CLI} --file ${fileA}`, execOpts);
');
    } catch (err: any) {
      expect(err.status).toBe(2);
    }
  });

  it('outputs JSON when --format json', () => {
    try {
      execSync(`node ${CLI} --file ${fileA} --file ${fileB} --format json`, execOpts);
    } catch (err: any) {
      expect(err.stdout).toContain('{');
    }
  });
});
