import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
} from './envSnapshot';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-snap-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('createSnapshot', () => {
  it('creates a snapshot with correct fields', () => {
    const snap = createSnapshot('prod', '.env.prod', { KEY: 'val' });
    expect(snap.label).toBe('prod');
    expect(snap.source).toBe('.env.prod');
    expect(snap.data).toEqual({ KEY: 'val' });
    expect(snap.timestamp).toBeTruthy();
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  it('round-trips a snapshot to disk', () => {
    const snap = createSnapshot('staging', '.env.staging', { FOO: 'bar' });
    const filepath = saveSnapshot(snap, tmpDir);
    expect(fs.existsSync(filepath)).toBe(true);
    const loaded = loadSnapshot(filepath);
    expect(loaded.label).toBe('staging');
    expect(loaded.data).toEqual({ FOO: 'bar' });
  });

  it('throws on invalid snapshot file', () => {
    const bad = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(bad, JSON.stringify({ foo: 1 }));
    expect(() => loadSnapshot(bad)).toThrow('Invalid snapshot file');
  });
});

describe('listSnapshots', () => {
  it('returns empty array for missing dir', () => {
    expect(listSnapshots(path.join(tmpDir, 'nonexistent'))).toEqual([]);
  });

  it('lists saved snapshots sorted', () => {
    saveSnapshot(createSnapshot('a', 'a', {}), tmpDir);
    saveSnapshot(createSnapshot('b', 'b', {}), tmpDir);
    const list = listSnapshots(tmpDir);
    expect(list.length).toBe(2);
    expect(list[0] < list[1]).toBe(true);
  });
});
