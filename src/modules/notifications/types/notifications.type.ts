import type { NotificationEntity } from '../entities/notification.entity';

export type NotificationsSort = 'oldest' | 'recent';
export type NotificationsFilter = 'all' | 'unChecked' | 'checked';

export type NotificationsQuery = {
  page?: number;
  pageSize?: number;
  sort?: NotificationsSort;
  filter?: NotificationsFilter;
};

export type NormalizedNotificationsQuery = {
  page: number;
  pageSize: number;
  sort: NotificationsSort;
  filter: NotificationsFilter;
};

export type NotificationsPageResult = {
  notifications: NotificationEntity[];
  totalCount: number;
};
