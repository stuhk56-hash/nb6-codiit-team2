import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;
const HASH_PREFIX = 'scrypt';

function toHexBuffer(value: string) {
  return Buffer.from(value, 'hex');
}

function isScryptHash(value: string) {
  return value.startsWith(`${HASH_PREFIX}$`);
}

export function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `${HASH_PREFIX}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  if (!stored) return false;

  // Legacy plain-text compatibility for existing seed/users.
  if (!isScryptHash(stored)) {
    return stored === password;
  }

  const [, salt, expectedHex] = stored.split('$');
  if (!salt || !expectedHex) return false;

  const expected = toHexBuffer(expectedHex);
  const actual = scryptSync(password, salt, expected.length);

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
