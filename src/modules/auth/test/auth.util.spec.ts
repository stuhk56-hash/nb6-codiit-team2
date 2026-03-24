import { Request } from 'express';
import {
  extractAccessToken,
  extractRefreshToken,
  getRefreshCookieOptions,
} from '../utils/auth.util';

describe('auth.util', () => {
  describe('extractAccessToken', () => {
    it('should return bearer token from authorization header', () => {
      const req = {
        headers: { authorization: 'Bearer access-token' },
      } as unknown as Request;

      expect(extractAccessToken(req)).toBe('access-token');
    });

    it('should return null for invalid authorization header', () => {
      const req = {
        headers: { authorization: 'Basic something' },
      } as unknown as Request;

      expect(extractAccessToken(req)).toBeNull();
    });
  });

  describe('extractRefreshToken', () => {
    it('should return refresh token from cookie', () => {
      const req = {
        cookies: { refreshToken: 'refresh-token' },
      } as unknown as Request;

      expect(extractRefreshToken(req)).toBe('refresh-token');
    });

    it('should return null for empty cookie token', () => {
      const req = {
        cookies: { refreshToken: '   ' },
      } as unknown as Request;

      expect(extractRefreshToken(req)).toBeNull();
    });
  });

  describe('getRefreshCookieOptions', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should set secure true when sameSite is none', () => {
      process.env.NODE_ENV = 'production';
      process.env.AUTH_COOKIE_SAME_SITE = 'none';
      delete process.env.AUTH_COOKIE_SECURE;

      const options = getRefreshCookieOptions();

      expect(options.sameSite).toBe('none');
      expect(options.secure).toBe(true);
      expect(options.httpOnly).toBe(true);
      expect(options.path).toBe('/');
    });
  });
});
