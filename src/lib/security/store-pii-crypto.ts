import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const PREFIX = 'enc:v1';
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

function getKey() {
  const isProduction = process.env.NODE_ENV === 'production';
  const storePiiKey = process.env.STORE_PII_ENCRYPTION_KEY;
  if (isProduction && !storePiiKey) {
    throw new Error('STORE_PII_ENCRYPTION_KEY is required in production');
  }

  const secret =
    storePiiKey ??
    process.env.JWT_REFRESH_SECRET ??
    'dev-store-pii-encryption-key';
  return createHash('sha256').update(secret).digest();
}

function isEncrypted(value: string) {
  return value.startsWith(`${PREFIX}:`);
}

export function encryptStorePii(value: string) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptStorePii(value: string) {
  if (!isEncrypted(value)) {
    return value;
  }

  const parts = value.split(':');
  if (parts.length !== 5) {
    return value;
  }

  const iv = Buffer.from(parts[2], 'base64');
  const authTag = Buffer.from(parts[3], 'base64');
  const encrypted = Buffer.from(parts[4], 'base64');

  if (iv.length !== IV_BYTES || authTag.length !== AUTH_TAG_BYTES) {
    return value;
  }

  try {
    const decipher = createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return value;
  }
}

export function encryptStorePiiNullable(value?: string | null) {
  if (value === undefined || value === null) {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  return encryptStorePii(trimmed);
}

export function decryptStorePiiNullable(value?: string | null) {
  if (value === undefined || value === null) {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  return decryptStorePii(trimmed);
}
