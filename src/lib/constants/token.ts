import { createHash, randomUUID } from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TokenPayload, TokenType } from '../../types/token.type';

function isTokenPayload(payload: JwtPayload, type: TokenType): payload is TokenPayload {
  return typeof payload.sub === 'string' && payload.type === type;
}

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function getSecret(type: TokenType) {
  return type === 'access'
    ? requireEnv('JWT_ACCESS_SECRET')
    : requireEnv('JWT_REFRESH_SECRET');
}

function getTtlSec(type: TokenType) {
  return type === 'access'
    ? Number(process.env.JWT_ACCESS_EXPIRES_IN_SEC ?? 60 * 60)
    : Number(process.env.JWT_REFRESH_EXPIRES_IN_SEC ?? 60 * 60 * 24 * 14);
}

function signToken(userId: string, type: TokenType) {
  return jwt.sign(
    {
      sub: userId,
      type,
      jti: randomUUID(),
    },
    getSecret(type),
    {
      algorithm: 'HS256',
      expiresIn: getTtlSec(type),
    },
  );
}

function verifyToken(token: string, type: TokenType): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret(type));
    if (typeof decoded === 'string') return null;

    if (!isTokenPayload(decoded, type)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function makeAccessToken(userId: string) {
  return signToken(userId, 'access');
}

export function makeRefreshToken(userId: string) {
  return signToken(userId, 'refresh');
}

export function parseUserIdFromToken(token?: string | null, type: TokenType = 'access') {
  if (!token) return null;
  const payload = verifyToken(token, type);
  if (!payload) return null;
  return payload.sub;
}

export function parseExpFromToken(token?: string | null, type: TokenType = 'refresh') {
  if (!token) return null;
  const payload = verifyToken(token, type);
  if (!payload) return null;
  if (!payload.exp) return null;
  return new Date(payload.exp * 1000);
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
