import { ForbiddenError, NotFoundError } from '../../../lib/errors/customErrors';
import {
  ensureNotificationOwner,
  normalizeNotificationsQuery,
  requireNotification,
} from '../utils/notifications.service.util';

describe('notifications.service.util', () => {
  test('normalizeNotificationsQuery는 기본값을 채운다', () => {
    expect(normalizeNotificationsQuery({})).toEqual({
      page: 1,
      pageSize: 10,
      sort: 'recent',
      filter: 'all',
    });
  });

  test('requireNotification은 null이면 NotFoundError를 던진다', () => {
    expect(() => requireNotification(null)).toThrow(NotFoundError);
  });

  test('ensureNotificationOwner는 소유자가 다르면 ForbiddenError를 던진다', () => {
    expect(() =>
      ensureNotificationOwner('user-2', {
        id: 'alarm-1',
        userId: 'user-1',
        content: '알림',
        isChecked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow(ForbiddenError);
  });
});
