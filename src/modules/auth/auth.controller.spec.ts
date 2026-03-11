import { Request, Response } from 'express';
import { login, logout, refresh } from './auth.controller';
import { authService } from './auth.service';
import { REFRESH_TOKEN_COOKIE_KEY } from './utils/auth.util';

jest.mock('./auth.service', () => ({
  authService: {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('./utils/auth.util', () => ({
  ...jest.requireActual('./utils/auth.util'),
  REFRESH_TOKEN_COOKIE_KEY: 'refreshToken',
}));

function makeResponse() {
  const res = {} as Response;
  res.cookie = jest.fn() as any;
  res.clearCookie = jest.fn() as any;
  res.status = jest.fn().mockReturnValue(res) as any;
  res.send = jest.fn().mockReturnValue(res) as any;
  return res;
}

describe('auth.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login should set refresh cookie and return access token + user', async () => {
    const req = {
      body: { email: 'seller1@codiit.com', password: 'codiit1234' },
    } as unknown as Request;
    const res = makeResponse();

    (authService.login as jest.Mock).mockResolvedValue({
      refreshToken: 'refresh-token',
      accessToken: 'access-token',
      user: { id: 'u1', email: 'seller1@codiit.com' },
    });

    await login(req, res);

    expect(authService.login).toHaveBeenCalledWith({
      email: 'seller1@codiit.com',
      password: 'codiit1234',
    });
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_KEY,
      'refresh-token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      user: { id: 'u1', email: 'seller1@codiit.com' },
      accessToken: 'access-token',
    });
  });

  it('refresh should use cookie token and return refreshed access token', async () => {
    const req = {
      cookies: { [REFRESH_TOKEN_COOKIE_KEY]: 'refresh-token' },
    } as unknown as Request;
    const res = makeResponse();

    (authService.refresh as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
    });

    await refresh(req, res);

    expect(authService.refresh).toHaveBeenCalledWith('refresh-token');
    expect(res.send).toHaveBeenCalledWith({ accessToken: 'new-access-token' });
  });

  it('logout should revoke refresh token and clear cookie', async () => {
    const req = {
      cookies: { [REFRESH_TOKEN_COOKIE_KEY]: 'refresh-token' },
    } as unknown as Request;
    const res = makeResponse();

    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    await logout(req, res);

    expect(authService.logout).toHaveBeenCalledWith('refresh-token');
    expect(res.clearCookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_KEY,
      expect.objectContaining({ path: '/' }),
    );
    expect(res.send).toHaveBeenCalledWith({
      message: '성공적으로 로그아웃되었습니다.',
    });
  });
});
