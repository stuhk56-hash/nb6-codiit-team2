import {
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import type { NotificationEntity } from '../entities/notification.entity';
import type {
  NormalizedNotificationsQuery,
  NotificationsQuery,
} from '../types/notifications.type';
import {
  DEFAULT_NOTIFICATIONS_FILTER,
  DEFAULT_NOTIFICATIONS_PAGE,
  DEFAULT_NOTIFICATIONS_PAGE_SIZE,
  DEFAULT_NOTIFICATIONS_SORT,
} from './notifications.util';

export function normalizeNotificationsQuery(
  query: NotificationsQuery,
): NormalizedNotificationsQuery {
  return {
    page: query.page && query.page > 0 ? query.page : DEFAULT_NOTIFICATIONS_PAGE,
    pageSize:
      query.pageSize && query.pageSize > 0
        ? query.pageSize
        : DEFAULT_NOTIFICATIONS_PAGE_SIZE,
    sort: query.sort ?? DEFAULT_NOTIFICATIONS_SORT,
    filter: query.filter ?? DEFAULT_NOTIFICATIONS_FILTER,
  };
}

export function requireNotification(
  notification: NotificationEntity | null,
  message = '해당 알람이 없습니다.',
): NotificationEntity {
  if (!notification) {
    throw new NotFoundError(message);
  }

  return notification;
}

export function ensureNotificationOwner(
  userId: string,
  notification: NotificationEntity,
) {
  if (notification.userId !== userId) {
    throw new ForbiddenError('접근 권한이 없습니다.');
  }
}
