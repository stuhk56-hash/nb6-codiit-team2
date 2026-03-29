import { Request, Response } from 'express';
import { login, logout, refresh } from '../auth.controller';
import { authService } from '../auth.service';
import { REFRESH_TOKEN_COOKIE_KEY } from '../utils/auth.util';

jest.mock('../auth.service');
jest.mock('../utils/auth.util', () => ({
  ...jest.requireActual('../utils/auth.util'),
  REFRESH_TOKEN_COOKIE_KEY: 'refreshToken',
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

const makeMockResponse = () => {
  const res = {} as Response;
  res.cookie = jest.fn().mockReturnThis();
  res.clearCookie = jest.fn().mockReturnThis();
  res.status = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
};

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    res = makeMockResponse();
  });

  describe('login', () => {
    beforeEach(() => {
      req = {
        body: { email: 'seller1@codiit.com', password: 'codiit1234' },
      };
    });

    it('로그인 시 리프레시 쿠키를 설정하고, 액세스 토큰과 사용자 정보를 반환한다', async () => {
      const loginResult = {
        refreshToken: 'refresh-token',
        accessToken: 'access-token',
        user: {
          id: 'u1',
          email: 'seller1@codiit.com',
          name: 'seller1',
          type: 'SELLER' as const,
          points: 0,
          image: '/images/profile-buyer.png',
          grade: null,
        },
      };
      mockAuthService.login.mockResolvedValue(loginResult);

      await login(req as Request, res);

      expect(mockAuthService.login).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE_KEY,
        loginResult.refreshToken,
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        user: loginResult.user,
        accessToken: loginResult.accessToken,
      });
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      req = {
        cookies: { [REFRESH_TOKEN_COOKIE_KEY]: 'refresh-token' },
      };
    });

    it('리프레시 시 쿠키 토큰을 사용하여 새로운 액세스 토큰을 발급한다', async () => {
      const refreshResult = { accessToken: 'new-access-token' };
      mockAuthService.refresh.mockResolvedValue(refreshResult);

      await refresh(req as Request, res);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        req.cookies?.[REFRESH_TOKEN_COOKIE_KEY],
      );
      expect(res.send).toHaveBeenCalledWith(refreshResult);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      req = {
        cookies: { [REFRESH_TOKEN_COOKIE_KEY]: 'refresh-token' },
      };
    });

    it('로그아웃 시 리프레시 토큰을 무효화하고 쿠키를 삭제한다', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await logout(req as Request, res);

      expect(mockAuthService.logout).toHaveBeenCalledWith(
        req.cookies?.[REFRESH_TOKEN_COOKIE_KEY],
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE_KEY,
        expect.objectContaining({ path: '/' }),
      );
      expect(res.send).toHaveBeenCalledWith({
        message: '성공적으로 로그아웃되었습니다.',
      });
    });
  });
});
