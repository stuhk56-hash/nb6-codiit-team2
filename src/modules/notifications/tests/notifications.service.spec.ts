import type { Response } from 'express';
import { notificationHub } from '../notification-hub';
import { notificationsRepository } from '../notifications.repository';
import { NotificationsService } from '../notifications.service';
import {
  toAlarmDto,
  toAlarmsResponseDto,
} from '../utils/notifications.mapper';
import {
  ensureNotificationOwner,
  normalizeNotificationsQuery,
  requireNotification,
} from '../utils/notifications.service.util';
import {
  initializeNotificationSse,
  writeNotificationSseData,
} from '../utils/notifications.sse.util';

jest.mock('../notification-hub', () => ({
  notificationHub: {
    add: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('../notifications.repository', () => ({
  notificationsRepository: {
    findPageByUserId: jest.fn(),
    findById: jest.fn(),
    updateCheckedById: jest.fn(),
    findCreatedAfter: jest.fn(),
  },
}));

jest.mock('../utils/notifications.mapper', () => ({
  toAlarmDto: jest.fn((notification: any) => ({ id: notification.id })),
  toAlarmsResponseDto: jest.fn((notifications: any[], totalCount: number) => ({
    list: notifications,
    totalCount,
  })),
}));

jest.mock('../utils/notifications.service.util', () => ({
  ensureNotificationOwner: jest.fn(),
  normalizeNotificationsQuery: jest.fn(),
  requireNotification: jest.fn((notification: unknown) => notification),
}));

jest.mock('../utils/notifications.sse.util', () => ({
  initializeNotificationSse: jest.fn(),
  writeNotificationSseData: jest.fn(),
}));

describe('notifications.service', () => {
  const service = new NotificationsService();
  const mockedRepository = notificationsRepository as jest.Mocked<
    typeof notificationsRepository
  >;
  const mockedHub = notificationHub as jest.Mocked<typeof notificationHub>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('알림 목록 조회 필터/정렬 로직을 검증한다', async () => {
    const normalized = {
      page: 2,
      pageSize: 5,
      sort: 'oldest',
      filter: 'checked',
    };
    const notifications = [{ id: 'alarm-1' }] as any[];
    (normalizeNotificationsQuery as jest.Mock).mockReturnValue(normalized);
    mockedRepository.findPageByUserId.mockResolvedValue({
      notifications,
      totalCount: 1,
    } as any);

    const result = await service.findMyNotifications(
      { id: 'user-1', type: 'BUYER' } as any,
      {
        page: 2,
        pageSize: 5,
        sort: 'oldest',
        filter: 'checked',
      },
    );

    expect(normalizeNotificationsQuery).toHaveBeenCalledWith({
      page: 2,
      pageSize: 5,
      sort: 'oldest',
      filter: 'checked',
    });
    expect(mockedRepository.findPageByUserId).toHaveBeenCalledWith(
      'user-1',
      normalized,
    );
    expect(toAlarmsResponseDto).toHaveBeenCalledWith(notifications, 1);
    expect(result).toEqual({ list: notifications, totalCount: 1 });
  });

  test('알림 읽음 처리 권한/존재 검증을 테스트한다', async () => {
    const notification = {
      id: 'alarm-1',
      userId: 'user-1',
      isChecked: false,
    } as any;
    const checked = {
      id: 'alarm-1',
      userId: 'user-1',
      isChecked: true,
    } as any;
    mockedRepository.findById.mockResolvedValue(notification);
    mockedRepository.updateCheckedById.mockResolvedValue(checked);

    const result = await service.checkNotification(
      { id: 'user-1', type: 'BUYER' } as any,
      'alarm-1',
    );

    expect(requireNotification).toHaveBeenCalledWith(notification);
    expect(ensureNotificationOwner).toHaveBeenCalledWith('user-1', notification);
    expect(mockedRepository.updateCheckedById).toHaveBeenCalledWith('alarm-1');
    expect(toAlarmDto).toHaveBeenCalledWith(checked);
    expect(result).toEqual({ id: 'alarm-1' });

    mockedRepository.findById.mockResolvedValueOnce({
      ...notification,
      isChecked: true,
    } as any);

    await service.checkNotification({ id: 'user-1', type: 'BUYER' } as any, 'alarm-1');

    expect(mockedRepository.updateCheckedById).toHaveBeenCalledTimes(1);
  });

  test('SSE 전송 대상 생성 로직을 테스트한다', async () => {
    const res = {
      on: jest.fn(),
      end: jest.fn(),
    } as unknown as Response;
    const createdAt = new Date('2026-03-23T00:00:00.000Z');
    mockedRepository.findCreatedAfter.mockResolvedValue([
      {
        id: 'alarm-1',
        userId: 'user-1',
        content: '새 알림',
        isChecked: false,
        createdAt,
        updatedAt: createdAt,
      },
    ] as any);

    service.connectSse({ id: 'user-1', type: 'BUYER' } as any, res);

    expect(initializeNotificationSse).toHaveBeenCalledWith(res);
    expect(mockedHub.add).toHaveBeenCalledWith('user-1', res);
    expect(writeNotificationSseData).toHaveBeenCalledWith(res, {});

    jest.advanceTimersByTime(30000);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockedRepository.findCreatedAfter).toHaveBeenCalledWith(
      'user-1',
      expect.any(Date),
    );
    expect(writeNotificationSseData).toHaveBeenCalledWith(res, {
      id: 'alarm-1',
    });

    const closeHandler = (res.on as jest.Mock).mock.calls.find(
      ([event]) => event === 'close',
    )?.[1];
    expect(closeHandler).toBeDefined();
    closeHandler();

    expect(mockedHub.remove).toHaveBeenCalledWith('user-1', res);
    expect(res.end).toHaveBeenCalled();
  });
});
