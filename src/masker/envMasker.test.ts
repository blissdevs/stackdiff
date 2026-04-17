import { isSensitiveKey, maskValue, maskEnvMap } from './envMasker';

describe('isSensitiveKey', () => {
  it('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('db_passwd')).toBe(true);
  });

  it('detects token keys', () => {
    expect(isSensitiveKey('GITHUB_TOKEN')).toBe(true);
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
  });

  it('detects api_key keys', () => {
    expect(isSensitiveKey('STRIPE_API_KEY')).toBe(true);
  });

  it('does not flag non-sensitive keys', () => {
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('DATABASE_URL')).toBe(false);
  });

  it('supports custom patterns', () => {
    expect(isSensitiveKey('MY_CUSTOM_VAR', [/custom/i])).toBe(true);
    expect(isSensitiveKey('OTHER_VAR', [/custom/i])).toBe(false);
  });
});

describe('maskValue', () => {
  it('replaces value with default mask', () => {
    expect(maskValue('supersecret')).toBe('***');
  });

  it('uses custom mask char', () => {
    expect(maskValue('supersecret', '####')).toBe('####');
  });

  it('reveals tail characters', () => {
    expect(maskValue('supersecret', '***', 3)).toBe('***ret');
  });

  it('handles empty string', () => {
    expect(maskValue('')).toBe('');
  });
});

describe('maskEnvMap', () => {
  const env = {
    PORT: '3000',
    NODE_ENV: 'production',
    DB_PASSWORD: 'hunter2',
    API_KEY: 'sk-abc123',
    APP_NAME: 'stackdiff',
  };

  it('masks sensitive keys and leaves others intact', () => {
    const masked = maskEnvMap(env);
    expect(masked.PORT).toBe('3000');
    expect(masked.NODE_ENV).toBe('production');
    expect(masked.APP_NAME).toBe('stackdiff');
    expect(masked.DB_PASSWORD).toBe('***');
    expect(masked.API_KEY).toBe('***');
  });

  it('respects revealTail option', () => {
    const masked = maskEnvMap(env, { revealTail: 3 });
    expect(masked.DB_PASSWORD).toBe('***er2');
  });

  it('respects custom sensitivePatterns', () => {
    const masked = maskEnvMap(env, { sensitivePatterns: [/app_name/i] });
    expect(masked.APP_NAME).toBe('***');
    expect(masked.DB_PASSWORD).toBe('hunter2');
  });
});
