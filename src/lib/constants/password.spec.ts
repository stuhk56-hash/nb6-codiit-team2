import { hashPassword, verifyPassword } from './password';

describe('password util', () => {
  it('hashPassword should return scrypt prefixed hash', () => {
    const hashed = hashPassword('codiit1234');

    expect(hashed.startsWith('scrypt$')).toBe(true);
    expect(hashed).not.toBe('codiit1234');
  });

  it('verifyPassword should validate hashed password', () => {
    const raw = 'codiit1234';
    const hashed = hashPassword(raw);

    expect(verifyPassword(raw, hashed)).toBe(true);
    expect(verifyPassword('wrong-password', hashed)).toBe(false);
  });

  it('verifyPassword should support legacy plain text values', () => {
    expect(verifyPassword('codiit1234', 'codiit1234')).toBe(true);
    expect(verifyPassword('wrong', 'codiit1234')).toBe(false);
  });
});
