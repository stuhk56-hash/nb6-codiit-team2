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
import {
  LoginInput,
  LoginResponseDto,
  RefreshResponseDto,
} from './types/auth.type';
import {
  ensureLoginMatched,
  resolveLoginUserImage,
  ensureRefreshTokenRowValid,
  requireRefreshUser,
  requireRefreshUserId,
} from './utils/auth.service.util';
import { scryptSync, timingSafeEqual } from 'crypto';

const HASH_PREFIX = 'scrypt';
const SCRYPT_KEYLEN = 64;

function verifyPassword(password: string, hash: string): boolean {
  if (!hash.startsWith(`${HASH_PREFIX}$`)) {
    return password === hash;
  }
  const [, salt, key] = hash.split('$');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN);
  return timingSafeEqual(keyBuffer, derivedKey);
}
export class AuthService {
  async login(data: LoginInput): Promise<LoginResponseDto> {
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

    const resolvedImage = await resolveLoginUserImage(user);

    return toLoginResponse(
      toLoginUserPayload(user, resolvedImage),
      makeAccessToken(user.id),
      refreshToken,
    );
  }

  async refresh(refreshToken?: string | null): Promise<RefreshResponseDto> {
    const userId = requireRefreshUserId(refreshToken);

    const tokenRow = await authRepository.findRefreshTokenByHash(
      hashToken(refreshToken),
    );
    ensureRefreshTokenRowValid(tokenRow, userId);

    const user = await authRepository.findUserById(userId);
    requireRefreshUser(user);

    return toRefreshResponse(makeAccessToken(user.id));
  }

  async logout(refreshToken?: string | null): Promise<void> {
    if (!refreshToken) return;

    await authRepository.revokeRefreshToken(hashToken(refreshToken));
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await authRepository.findUserByEmail(email);
    if (user && verifyPassword(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }
}

export const authService = new AuthService();
