import { PrismaClient, User } from '@prisma/client';
import { AuthRepository } from '../auth.repository';
import { hashPassword } from '../../../lib/constants/password'; // Using the actual hash for setup

// NOTE: This test suite requires a running test database.
// Ensure your .env.test is configured and the database is up.
const prisma = new PrismaClient();
const authRepository = new AuthRepository();

describe('AuthRepository (Integration)', () => {
  let user: User;

  // Setup a clean state before each test
  beforeEach(async () => {
    // Clean up potential leftovers
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.grade.deleteMany();

    // Seed a grade
    await prisma.grade.create({
      data: {
        id: 'test-grade',
        name: 'Test Grade',
        rate: 5,
        minAmount: 0,
      },
    });

    // Seed a user
    user = await prisma.user.create({
      data: {
        email: 'test.user@example.com',
        name: 'Test User',
        type: 'BUYER',
        passwordHash: await hashPassword('password123'),
        gradeId: 'test-grade',
      },
    });
  });

  // Disconnect after all tests
  afterAll(async () => {
    // Final cleanup
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.$disconnect();
  });

  describe('findUserByEmailWithGrade', () => {
    it('존재하는 이메일로 사용자와 등급 정보를 반환해야 한다', async () => {
      const foundUser = await authRepository.findUserByEmailWithGrade(user.email);
      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.email).toBe(user.email);
      expect(foundUser?.grade).not.toBeNull();
      expect(foundUser?.grade?.name).toBe('Test Grade');
    });

    it('존재하지 않는 이메일로 null을 반환해야 한다', async () => {
      const foundUser = await authRepository.findUserByEmailWithGrade(
        'nonexistent@example.com',
      );
      expect(foundUser).toBeNull();
    });
  });

  describe('createRefreshToken', () => {
    it('새로운 리프레시 토큰을 DB에 생성해야 한다', async () => {
      const tokenData = {
        userId: user.id,
        tokenHash: 'test-token-hash',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      };
      const createdToken = await authRepository.createRefreshToken(tokenData);

      const dbToken = await prisma.refreshToken.findUnique({
        where: { tokenHash: 'test-token-hash' },
      });

      expect(createdToken.id).toBe(dbToken?.id);
      expect(dbToken?.userId).toBe(user.id);
    });
  });

  describe('findRefreshTokenByHash', () => {
    it('토큰 해시로 리프레시 토큰을 찾아야 한다', async () => {
      const tokenHash = 'find-me-hash';
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(),
        },
      });

      const foundToken = await authRepository.findRefreshTokenByHash(tokenHash);
      expect(foundToken).not.toBeNull();
      expect(foundToken?.tokenHash).toBe(tokenHash);
    });
  });

  describe('findUserById', () => {
    it('ID로 사용자를 찾아야 한다', async () => {
      const foundUser = await authRepository.findUserById(user.id);
      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(user.id);
    });
  });

  describe('revokeRefreshToken', () => {
    it('리프레시 토큰의 revokedAt을 현재 시간으로 업데이트해야 한다', async () => {
      const tokenHash = 'revoke-me-hash';
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 1000 * 60),
        },
      });

      await authRepository.revokeRefreshToken(tokenHash);

      const dbToken = await prisma.refreshToken.findUnique({
        where: { tokenHash },
      });
      expect(dbToken?.revokedAt).not.toBeNull();
      // Check if the revokedAt is recent (within the last 5 seconds)
      expect(dbToken!.revokedAt!.getTime()).toBeGreaterThan(Date.now() - 5000);
    });
  });
});
