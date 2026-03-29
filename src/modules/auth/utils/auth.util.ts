import { CookieOptions, Request } from 'express';

type CookieSameSite = 'lax' | 'strict' | 'none';

function getCookieSameSite(): CookieSameSite {
  const value = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();
  if (value === 'lax' || value === 'strict' || value === 'none') return value;
  return process.env.NODE_ENV === 'production' ? 'none' : 'lax';
}

function getCookieSecure(sameSite: CookieSameSite) {
  const value = process.env.AUTH_COOKIE_SECURE?.toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (sameSite === 'none') return true;
  return process.env.NODE_ENV === 'production';
}

export function getRefreshCookieOptions(): CookieOptions {
  const sameSite = getCookieSameSite();
  const secure = getCookieSecure(sameSite);
  const domain = process.env.AUTH_COOKIE_DOMAIN;

  return {
    httpOnly: true,
    sameSite,
    secure,
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

export function getRefreshCookieClearOptions(): CookieOptions {
  const domain = process.env.AUTH_COOKIE_DOMAIN;
  return {
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

export function extractAccessToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

export const REFRESH_TOKEN_COOKIE_KEY = 'refreshToken';

export function extractRefreshToken(req: Request) {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE_KEY];
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  return trimmed.length > 0 ? trimmed : null;
}
