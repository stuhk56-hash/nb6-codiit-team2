import { AuthService } from '../auth.service';
import { authRepository } from '../auth.repository';
import {
  verifyPassword,
} from '../../../lib/constants/password';
import {
  hashToken,
  makeAccessToken,
  makeRefreshToken,
  parseExpFromToken,
  parseUserIdFromToken,
} from '../../../lib/constants/token';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';
import { UnauthorizedError } from '../../../lib/errors/customErrors';
import { User } from '@prisma/client';

// Mock all dependencies
jest.mock('../auth.repository');
jest.mock('../../../lib/constants/password');
jest.mock('../../../lib/constants/token');
jest.mock('../../s3/utils/s3.service.util');

const mockAuthRepository = authRepository as jest.Mocked<typeof authRepository>;
const mockVerifyPassword = verifyPassword as jest.Mock;
const mockMakeAccessToken = makeAccessToken as jest.Mock;
const mockMakeRefreshToken = makeRefreshToken as jest.Mock;
const mockParseExpFromToken = parseExpFromToken as jest.Mock;
const mockHashToken = hashToken as jest.Mock;
const mockParseUserIdFromToken = parseUserIdFromToken as jest.Mock;
const mockResolveS3ImageUrl = resolveS3ImageUrl as jest.Mock;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'password123',
    };
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      imageUrl: null,
      imageKey: null,
    } as User & { imageUrl: string | null; imageKey: string | null; grade: any };


    it('성공적인 로그인 시 토큰과 사용자 정보를 반환해야 한다', async () => {
      // Mock repository and utils
      mockAuthRepository.findUserByEmailWithGrade.mockResolvedValue(mockUser);
      mockVerifyPassword.mockReturnValue(true);
      mockMakeRefreshToken.mockReturnValue('mock-refresh-token');
      mockParseExpFromToken.mockReturnValue(new Date(Date.now() + 1000 * 60 * 60));
      mockHashToken.mockReturnValue('hashed-refresh-token');
      mockAuthRepository.createRefreshToken.mockResolvedValue({} as any);
      mockResolveS3ImageUrl.mockResolvedValue('default-profile-image-url');
      mockMakeAccessToken.mockReturnValue('mock-access-token');

      const result = await authService.login(loginInput);

      expect(mockAuthRepository.findUserByEmailWithGrade).toHaveBeenCalledWith(loginInput.email);
      expect(mockVerifyPassword).toHaveBeenCalledWith(loginInput.password, mockUser.passwordHash);
      expect(mockAuthRepository.createRefreshToken).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.email).toBe(loginInput.email);
    });

    it('사용자를 찾을 수 없으면 UnauthorizedError를 던져야 한다', async () => {
      mockAuthRepository.findUserByEmailWithGrade.mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toThrow(
        new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.'),
      );
    });

    it('비밀번호가 일치하지 않으면 UnauthorizedError를 던져야 한다', async () => {
      mockAuthRepository.findUserByEmailWithGrade.mockResolvedValue(mockUser);
      mockVerifyPassword.mockReturnValue(false);

      await expect(authService.login(loginInput)).rejects.toThrow(
        new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.'),
      );
    });
  });

  describe('refresh', () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockUserId = 'user-1';
    const mockTokenHash = 'hashed-valid-refresh-token';
    const mockTokenRow = {
      userId: mockUserId,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60),
    };
    const mockUser = { id: mockUserId };

    it('유효한 리프레시 토큰으로 새로운 액세스 토큰을 반환해야 한다', async () => {
      mockParseUserIdFromToken.mockReturnValue(mockUserId);
      mockHashToken.mockReturnValue(mockTokenHash);
      mockAuthRepository.findRefreshTokenByHash.mockResolvedValue(mockTokenRow as any);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser as any);
      mockMakeAccessToken.mockReturnValue('new-access-token');

      const result = await authService.refresh(mockRefreshToken);

      expect(mockParseUserIdFromToken).toHaveBeenCalledWith(mockRefreshToken, 'refresh');
      expect(mockHashToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockAuthRepository.findRefreshTokenByHash).toHaveBeenCalledWith(mockTokenHash);
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(result.accessToken).toBe('new-access-token');
    });

    it('리프레시 토큰이 없으면 UnauthorizedError를 던져야 한다', async () => {
      mockParseUserIdFromToken.mockReturnValue(null);

      await expect(authService.refresh(null)).rejects.toThrow(
        new UnauthorizedError('리프레시 토큰이 유효하지 않습니다.'),
      );
    });

    it('DB에 토큰이 없으면 UnauthorizedError를 던져야 한다', async () => {
      mockParseUserIdFromToken.mockReturnValue(mockUserId);
      mockHashToken.mockReturnValue(mockTokenHash);
      mockAuthRepository.findRefreshTokenByHash.mockResolvedValue(null);

      await expect(authService.refresh(mockRefreshToken)).rejects.toThrow(
        new UnauthorizedError('리프레시 토큰이 유효하지 않습니다.'),
      );
    });
  });

  describe('logout', () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockTokenHash = 'hashed-valid-refresh-token';

    it('리프레시 토큰을 무효화해야 한다', async () => {
      mockHashToken.mockReturnValue(mockTokenHash);
      mockAuthRepository.revokeRefreshToken.mockResolvedValue({} as any);

      await authService.logout(mockRefreshToken);

      expect(mockHashToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockAuthRepository.revokeRefreshToken).toHaveBeenCalledWith(mockTokenHash);
    });

    it('리프레시 토큰이 없으면 아무것도 하지 않아야 한다', async () => {
      await authService.logout(null);

      expect(mockAuthRepository.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });
});
