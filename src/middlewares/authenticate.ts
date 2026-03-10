import { NextFunction, Response } from 'express';
import { prisma } from '../lib/constants/prismaClient';
import { parseUserIdFromToken } from '../lib/constants/token';
import { makeUnauthorizedError } from '../lib/errors/errorUtils';
import { extractAccessToken } from '../modules/auth/utils/auth.util';
import { AuthenticatedRequest } from '../types/auth-request.type';
import { AuthenticateOptions } from '../types/authenticate.type';

export type { AuthenticatedRequest } from '../types/auth-request.type';

export function authenticate(options?: AuthenticateOptions) {
  return async function authenticateMiddleware(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ) {
    const token = extractAccessToken(req);
    if (!token) {
      throw makeUnauthorizedError(options, 'Authorization 헤더가 없습니다.');
    }
    const userId = parseUserIdFromToken(token, 'access');

    if (!userId) {
      throw makeUnauthorizedError(options, '유효하지 않은 액세스 토큰입니다.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw makeUnauthorizedError(options, '인증된 사용자를 찾을 수 없습니다.');
    }

    req.user = user;

    next();
  };
}
