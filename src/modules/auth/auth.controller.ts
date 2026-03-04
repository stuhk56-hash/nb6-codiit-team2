import { Request, Response } from 'express';
import { create as structCreate } from 'superstruct';
import { authService } from './auth.service';
import { LoginBodyStruct } from './structs/auth.struct';
import { extractRefreshToken } from './utils/auth.util';

export async function login(req: Request, res: Response) {
  const body = structCreate(req.body, LoginBodyStruct);
  const { email, password } = body;
  const result = await authService.login({ email, password });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });

  res.status(201).send({
    user: result.user,
    accessToken: result.accessToken,
  });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = extractRefreshToken(req);
  const result = await authService.refresh(refreshToken);

  res.send(result);
}

export async function logout(req: Request, res: Response) {
  const refreshToken = extractRefreshToken(req);
  await authService.logout(refreshToken);
  res.clearCookie('refreshToken', { path: '/' });
  res.send({ message: '성공적으로 로그아웃되었습니다.' });
}
