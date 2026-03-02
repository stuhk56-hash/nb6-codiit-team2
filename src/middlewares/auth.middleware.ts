import type { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ENV } from '../configs/env.js';

const toSafeRole = (value: unknown): 'BUYER' | 'SELLER' | 'ADMIN' | undefined => {
  if (value === 'BUYER' || value === 'SELLER' || value === 'ADMIN') return value;
  return undefined;
};

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7).trim();
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, ENV.ACCESS_SECRET) as {
      id?: number | string;
      sub?: number | string;
      email?: string;
      role?: string;
    };

    const id = decoded.id ?? decoded.sub;
    const role = toSafeRole(decoded.role);

    if (id && role) {
      req.user = {
        id: Number(id),
        email: decoded.email ?? '',
        role,
      };
    }
  } catch {
    // 인증 실패는 여기서 바로 차단하지 않고, 각 도메인 서비스에서 처리
  }

  return next();
};
