import { isSensitiveKey, maskValue, maskEnvMap } from './envMasker';

describe('isSensitiveKey', () => {
  it('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
  });

  it('detects secret keys', () => {
    expect(isSensitiveKey('APP_SECRET')).toBe(true);
    expect(isSensitiveKey('SECRET_KEY')).toBe(true);
  });

  it('detects token keys', () => {
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
    expect(isSensitiveKey('API_TOKEN')).toBe(true);
  });

  it('detects private key keys', () => {
    expect(isSensitiveKey('PRIVATE_KEY')).toBe(true);
  });

  it('does not flag safe keys', () => {
    expect(isSensitiveKey('APP_NAME')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
  });
});

describe('maskValue', () => {
  it('masks a normal value', () => {
    expect(maskValue('supersecret')).toBe('***');
  });

  it('masks an empty value', () => {
    expect(maskValue('')).toBe('***');
  });

  it('partially reveals long values when partial=true', () => {
    const result = maskValue('supersecretvalue', true);
    expect(result).toMatch(/^su\*+/);
  });
});

describe('maskEnvMap', () => {
  const env = new Map([
    ['APP_NAME', 'myapp'],
    ['DB_PASSWORD', 'hunter2'],
    ['AUTH_TOKEN', 'tok_abc123'],
    ['PORT', '3000'],
  ]);

  it('masks sensitive keys and leaves others', () => {
    const masked = maskEnvMap(env);
    expect(masked.get('APP_NAME')).toBe('myapp');
    expect(masked.get('PORT')).toBe('3000');
    expect(masked.get('DB_PASSWORD')).toBe('***');
    expect(masked.get('AUTH_TOKEN')).toBe('***');
  });

  it('does not mutate the original map', () => {
    maskEnvMap(env);
    expect(env.get('DB_PASSWORD')).toBe('hunter2');
  });

  it('supports partial masking option', () => {
    const masked = maskEnvMap(env, { partial: true });
    const token = masked.get('AUTH_TOKEN') ?? '';
    expect(token).toMatch(/^to\*+/);
  });
});
