import { prisma } from '../../lib/constants/prismaClient';

export class AuthRepository {
  findUserByEmailWithGrade(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { grade: true },
    });
  }

  createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.refreshToken.create({
      data,
    });
  }

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.update({
      where: {
        tokenHash,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}

export const authRepository = new AuthRepository();
