/**
 * @description 토큰 생성 및 검증 유틸리티 모듈
 * 언제든지 수정 가능하니 문제 있으면 알려주세요!
 * @author 이호성
 * @date 2025-12-29
 * @version 1.0
 **/

import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { TokenPayload } from '../types/jwt.js';
import { AppError, UnauthorizedError } from '../errors/error-handler.js';
import { ENV } from '../configs/env.js';

const generateAccessSecret = (): Secret => {
  if (!ENV.JWT_SECRET) {
    throw new AppError('비밀키가 설정되지 않았습니다', 500);
  }
  return ENV.JWT_SECRET as Secret;
};

const generateRefreshSecret = (): Secret => {
  if (!ENV.REFRESH_SECRET) {
    throw new AppError('비밀키가 설정되지 않았습니다', 500);
  }
  return ENV.REFRESH_SECRET as Secret;
};

export const generateAccessToken = (
  payload: string | Buffer | object
): string => {
  try {
    return jwt.sign(payload, generateAccessSecret(), {
      expiresIn: (ENV.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1h',
    } as SignOptions);
  } catch (error) {
    throw new AppError('토큰 생성 실패', 500);
  }
};

export const generateRefreshToken = (
  payload: string | Buffer | object
): string => {
  try {
    return jwt.sign(payload, generateRefreshSecret(), {
      expiresIn: (ENV.REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '7d',
    } as SignOptions);
  } catch (error) {
    throw new AppError('토큰 생성 실패', 500);
  }
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, secret);
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof (decoded as Partial<TokenPayload>).id !== 'number'
    ) {
      throw new UnauthorizedError(null, '유효하지 않은 토큰입니다');
    }
    return decoded as TokenPayload;
  } catch (_error) {
    throw new UnauthorizedError(null, '유효하지 않은 토큰입니다');
  }
};
