import type { Response } from 'express';
import type { AuthUser } from '../../types/auth-request.type';
import type { Notification } from '@prisma/client';
import type { AlarmDto } from './dto/alarm.dto';
import type { AlarmsResponseDto } from './dto/alarms-response.dto';
import { notificationHub } from './notification-hub';
import { notificationsRepository } from './notifications.repository';
import type { NotificationsQuery } from './types/notifications.type';
import {
  toAlarmDto,
  toAlarmsResponseDto,
} from './utils/notifications.mapper';
import {
  ensureNotificationOwner,
  normalizeNotificationsQuery,
  requireNotification,
} from './utils/notifications.service.util';
import {
  initializeNotificationSse,
  writeNotificationSseData,
} from './utils/notifications.sse.util';

export class NotificationsService {
  emitCreatedNotification(notification: Notification) {
    notificationHub.emit(notification.userId, toAlarmDto(notification));
  }

  async findMyNotifications(
    user: AuthUser,
    query: NotificationsQuery,
  ): Promise<AlarmsResponseDto> {
    const normalized = normalizeNotificationsQuery(query);
    const { notifications, totalCount } =
      await notificationsRepository.findPageByUserId(user.id, normalized);

    return toAlarmsResponseDto(notifications, totalCount);
  }

  async checkNotification(user: AuthUser, alarmId: string): Promise<AlarmDto> {
    const notification = requireNotification(
      await notificationsRepository.findById(alarmId),
    );
    ensureNotificationOwner(user.id, notification);

    if (notification.isChecked) {
      return toAlarmDto(notification);
    }

    const checked = await notificationsRepository.updateCheckedById(alarmId);
    return toAlarmDto(checked);
  }

  connectSse(user: AuthUser, res: Response) {
    initializeNotificationSse(res);
    notificationHub.add(user.id, res);
    writeNotificationSseData(res, {});

    const interval = setInterval(() => {
      writeNotificationSseData(res, {});
    }, 30000);

    res.on('close', () => {
      clearInterval(interval);
      notificationHub.remove(user.id, res);
      res.end();
    });
  }
}

export const notificationsService = new NotificationsService();
