import { Request } from 'express';

export function extractRefreshToken(req: Request) {
  return req.cookies.refreshToken;
}
