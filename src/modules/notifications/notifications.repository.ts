import { prisma } from '../../lib/constants/prismaClient';
import type { NotificationsPageResult } from './types/notifications.type';
import type { NormalizedNotificationsQuery } from './types/notifications.type';

export class NotificationsRepository {
  async findPageByUserId(
    userId: string,
    query: NormalizedNotificationsQuery,
  ): Promise<NotificationsPageResult> {
    const where = {
      userId,
      ...(query.filter === 'checked' ? { isChecked: true } : {}),
      ...(query.filter === 'unChecked' ? { isChecked: false } : {}),
    };

    const [notifications, totalCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: query.sort === 'oldest' ? 'asc' : 'desc',
        },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.notification.count({
        where,
      }),
    ]);

    return {
      notifications,
      totalCount,
    };
  }

  findById(alarmId: string) {
    return prisma.notification.findUnique({
      where: {
        id: alarmId,
      },
    });
  }

  updateCheckedById(alarmId: string) {
    return prisma.notification.update({
      where: {
        id: alarmId,
      },
      data: {
        isChecked: true,
      },
    });
  }

  findCreatedAfter(userId: string, createdAt: Date) {
    return prisma.notification.findMany({
      where: {
        userId,
        createdAt: {
          gt: createdAt,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

export const notificationsRepository = new NotificationsRepository();
