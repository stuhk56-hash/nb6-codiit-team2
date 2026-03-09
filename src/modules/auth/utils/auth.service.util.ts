import { parseUserIdFromToken } from '../../../lib/constants/token';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../../lib/errors/customErrors';
import { LoginInput, RefreshTokenRow } from '../types/auth.type';

export function ensureLoginMatched(
  user: { passwordHash: string } | null,
  input: LoginInput,
) {
  if (!user) {
    throw new NotFoundError('요청한 리소스를 찾을 수 없습니다.');
  }

  if (user.passwordHash !== input.password) {
    throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.');
  }
}

export function requireRefreshUserId(refreshToken?: string | null) {
  if (!refreshToken) {
    throw new BadRequestError('잘못된 요청입니다.');
  }

  const userId = parseUserIdFromToken(refreshToken, 'refresh');
  if (!userId) {
    throw new UnauthorizedError('리프레시 토큰이 유효하지 않습니다.');
  }

  return userId;
}

export function ensureRefreshTokenRowValid(
  tokenRow: RefreshTokenRow | null,
  userId: string,
) {
  if (!tokenRow || tokenRow.userId !== userId || tokenRow.revokedAt || tokenRow.expiresAt < new Date()) {
    throw new UnauthorizedError('리프레시 토큰이 유효하지 않습니다.');
  }
}

export function requireRefreshUser(user: { id: string } | null) {
  if (!user) {
    throw new UnauthorizedError('리프레시 토큰이 유효하지 않습니다.');
  }
}
