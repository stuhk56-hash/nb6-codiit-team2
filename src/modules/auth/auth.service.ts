import {
  hashToken,
  makeAccessToken,
  makeRefreshToken,
  parseExpFromToken,
} from '../../lib/constants/token';
import { UnauthorizedError } from '../../lib/errors/customErrors';
import { authRepository } from './auth.repository';
import {
  toLoginResponse,
  toLoginUserPayload,
  toRefreshResponse,
} from './utils/auth.mapper';
import { LoginInput } from './types/auth.type';
import {
  ensureLoginMatched,
  ensureRefreshTokenRowValid,
  requireRefreshUser,
  requireRefreshUserId,
} from './utils/auth.service.util';

export class AuthService {
  async login(data: LoginInput) {
    const user = await authRepository.findUserByEmailWithGrade(data.email);
    ensureLoginMatched(user, data);

    const refreshToken = makeRefreshToken(user.id);
    const refreshExpiresAt = parseExpFromToken(refreshToken, 'refresh');
    if (!refreshExpiresAt) {
      throw new UnauthorizedError('리프레시 토큰이 유효하지 않습니다.');
    }

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiresAt,
    });

    return toLoginResponse(
      toLoginUserPayload(user),
      makeAccessToken(user.id),
      refreshToken,
    );
  }

  async refresh(refreshToken?: string | null) {
    const userId = requireRefreshUserId(refreshToken);

    const tokenRow = await authRepository.findRefreshTokenByHash(
      hashToken(refreshToken),
    );
    ensureRefreshTokenRowValid(tokenRow, userId);

    const user = await authRepository.findUserById(userId);
    requireRefreshUser(user);

    return toRefreshResponse(makeAccessToken(user.id));
  }

  async logout(refreshToken?: string | null) {
    if (!refreshToken) return;

    await authRepository.revokeRefreshToken(hashToken(refreshToken));
  }
}

export const authService = new AuthService();
