import { NextFunction, Response } from 'express';
import { prisma } from '../lib/constants/prismaClient';
import { parseUserIdFromToken } from '../lib/constants/token';
import { UnauthorizedError } from '../lib/errors/customErrors';
import { AuthenticatedRequest } from '../types/auth-request.type';

export type { AuthenticatedRequest } from '../types/auth-request.type';

export function authenticate() {
  return async function authenticateMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('Authorization 헤더가 없습니다.');
    }

    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const userId = parseUserIdFromToken(token, 'access');

    if (!userId) {
      throw new UnauthorizedError('유효하지 않은 액세스 토큰입니다.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedError('인증된 사용자를 찾을 수 없습니다.');
    }

    req.user = user;

    next();
  };
}
