import { exportToEnv, exportToJson, exportToCsv, exportEnvMap } from './envExporter';

const sampleMap: Record<string, string> = {
  APP_NAME: 'myapp',
  PORT: '3000',
  DATABASE_URL: 'postgres://localhost/db',
  EMPTY_VAR: '',
  SPACED_VALUE: 'hello world',
};

describe('exportToEnv', () => {
  it('exports simple key=value pairs', () => {
    const result = exportToEnv({ APP_NAME: 'myapp', PORT: '3000' });
    expect(result).toContain('APP_NAME=myapp');
    expect(result).toContain('PORT=3000');
  });

  it('quotes values with spaces', () => {
    const result = exportToEnv({ SPACED_VALUE: 'hello world' });
    expect(result).toBe('SPACED_VALUE="hello world"');
  });

  it('quotes values with hash characters', () => {
    const result = exportToEnv({ COMMENT_VAL: 'val#1' });
    expect(result).toBe('COMMENT_VAL="val#1"');
  });
});

describe('exportToJson', () => {
  it('exports valid JSON', () => {
    const result = exportToJson({ KEY: 'value' });
    const parsed = JSON.parse(result);
    expect(parsed.KEY).toBe('value');
  });

  it('is pretty printed', () => {
    const result = exportToJson({ A: '1' });
    expect(result).toContain('\n');
  });
});

describe('exportToCsv', () => {
  it('includes header row', () => {
    const result = exportToCsv({ KEY: 'val' });
    expect(result.startsWith('key,value')).toBe(true);
  });

  it('escapes values with commas', () => {
    const result = exportToCsv({ LIST: 'a,b,c' });
    expect(result).toContain('"a,b,c"');
  });
});

describe('exportEnvMap', () => {
  it('filters empty values when includeEmpty is false', () => {
    const result = exportEnvMap(sampleMap, { format: 'json', includeEmpty: false });
    const parsed = JSON.parse(result);
    expect(parsed.EMPTY_VAR).toBeUndefined();
    expect(parsed.APP_NAME).toBe('myapp');
  });

  it('throws on unsupported format', () => {
    expect(() =>
      exportEnvMap(sampleMap, { format: 'xml' as any })
    ).toThrow('Unsupported export format: xml');
  });

  it('includes all entries by default', () => {
    const result = exportEnvMap(sampleMap, { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed.EMPTY_VAR).toBe('');
  });
});
