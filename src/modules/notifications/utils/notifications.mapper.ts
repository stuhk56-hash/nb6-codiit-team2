import type { AlarmDto } from '../dto/alarm.dto';
import type { AlarmsResponseDto } from '../dto/alarms-response.dto';
import type { NotificationEntity } from '../entities/notification.entity';

export function toAlarmDto(notification: NotificationEntity): AlarmDto {
  return {
    id: notification.id,
    userId: notification.userId,
    content: notification.content,
    isChecked: notification.isChecked,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
  };
}

export function toAlarmsResponseDto(
  notifications: NotificationEntity[],
  totalCount: number,
): AlarmsResponseDto {
  return {
    list: notifications.map(toAlarmDto),
    totalCount,
  };
}
