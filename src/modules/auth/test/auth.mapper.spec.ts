import {
  toLoginUserPayload,
  toLoginResponse,
  toRefreshResponse,
} from '../utils/auth.mapper';
import {
  LoginUser,
  LoginUserPayloadDto,
} from '../types/auth.type';
import { UserType } from '@prisma/client';

describe('Auth Mapper', () => {
  describe('toLoginUserPayload', () => {
    it('User 엔티티와 이미지 URL을 LoginUserPayloadDto로 변환해야 한다', () => {
      const mockUser: LoginUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        type: UserType.BUYER,
        passwordHash: 'hashed-password',
        imageUrl: null,
        imageKey: null,
        points: 1000,
        deletedAt: null,
        gradeId: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        lifetimeSpend: 0,
        grade: {
          id: 'grade-1',
          name: 'Green',
          rate: 5,
          minAmount: 0,
        },
      };
      const mockImage = 'http://example.com/profile.jpg';

      const expectedPayload: LoginUserPayloadDto = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        type: UserType.BUYER,
        points: 1000,
        image: mockImage,
        grade: {
          id: 'grade-1',
          name: 'Green',
          rate: 5,
          minAmount: 0,
        },
      };

      const result = toLoginUserPayload(mockUser, mockImage);
      expect(result).toEqual(expectedPayload);
    });
  });

  describe('toLoginResponse', () => {
    it('사용자 페이로드와 토큰들을 LoginResponseDto로 결합해야 한다', () => {
      const userPayload: LoginUserPayloadDto = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        type: UserType.BUYER,
        points: 1000,
        image: 'http://example.com/profile.jpg',
        grade: null,
      };
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';

      const result = toLoginResponse(userPayload, accessToken, refreshToken);

      expect(result).toEqual({
        user: userPayload,
        accessToken,
        refreshToken,
      });
    });
  });

  describe('toRefreshResponse', () => {
    it('액세스 토큰을 RefreshResponseDto로 변환해야 한다', () => {
      const accessToken = 'new-access-token';
      const result = toRefreshResponse(accessToken);

      expect(result).toEqual({
        accessToken,
      });
    });
  });
});
