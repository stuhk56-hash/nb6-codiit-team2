import { UserType } from '@prisma/client';
import { prisma } from '../../lib/constants/prismaClient';

export class UsersRepository {
  create(data: {
    type: UserType;
    name: string;
    email: string;
    passwordHash: string;
    gradeId?: string;
  }) {
    return prisma.user.create({
      data,
      include: { grade: true },
    });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { grade: true },
    });
  }

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { grade: true },
    });
  }

  updateById(
    id: string,
    data: {
      name?: string;
      email?: string;
      passwordHash?: string;
      imageUrl?: string | null;
      imageKey?: string | null;
    },
  ) {
    return prisma.user.update({
      where: { id },
      data,
      include: { grade: true },
    });
  }

  softDeleteById(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  findLikedStores(userId: string) {
    return prisma.storeFavorite.findMany({
      where: { userId },
      include: {
        store: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findLowestGrade() {
    return prisma.grade.findFirst({
      orderBy: { minAmount: 'asc' },
    });
  }
}

export const usersRepository = new UsersRepository();
