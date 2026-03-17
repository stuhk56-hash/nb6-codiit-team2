import { verifyPassword } from '../../../lib/constants/password';
import { parseUserIdFromToken } from '../../../lib/constants/token';
import { UnauthorizedError } from '../../../lib/errors/customErrors';
import { LoginInput, RefreshTokenRow } from '../types/auth.type';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';

export function ensureLoginMatched(
  user: { passwordHash: string } | null,
  input: LoginInput,
) {
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.');
  }
}

export function requireRefreshUserId(refreshToken?: string | null) {
  const userId = parseUserIdFromToken(refreshToken, 'refresh');
  if (!userId || !refreshToken) {
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

export async function resolveLoginUserImage(user: {
  imageUrl: string | null;
  imageKey: string | null;
}) {
  return resolveS3ImageUrl(
    user.imageUrl,
    user.imageKey,
    '/images/profile-buyer.png',
  );
}
