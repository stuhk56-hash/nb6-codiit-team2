import { NextFunction, Response } from 'express';
import { prisma } from '../lib/constants/prismaClient';
import { parseUserIdFromToken } from '../lib/constants/token';
import { UnauthorizedError } from '../lib/errors/customErrors';
import { extractAccessToken } from '../modules/auth/utils/auth.util';
import { AuthenticatedRequest } from '../types/auth-request.type';
export type { AuthenticatedRequest } from '../types/auth-request.type';

export function authenticate() {
  return async function authenticateMiddleware(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ) {
    const token = extractAccessToken(req);
    if (!token) {
      throw new UnauthorizedError();
    }
    const userId = parseUserIdFromToken(token, 'access');

    if (!userId) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedError();
    }

    req.user = user;

    next();
  };
}

export function authenticateOptional() {
  return async function authenticateOptionalMiddleware(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ) {
    const token = extractAccessToken(req);
    if (!token) {
      next();
      return;
    }

    const userId = parseUserIdFromToken(token, 'access');
    if (!userId) {
      next();
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      req.user = user;
    }

    next();
  };
}
