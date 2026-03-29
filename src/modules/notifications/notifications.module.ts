import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  checkNotification,
  connectNotificationsSse,
  findMyNotifications,
} from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.get('/sse', authenticate(), withAsync(connectNotificationsSse));
notificationsRouter.get('/', authenticate(), withAsync(findMyNotifications));
notificationsRouter.patch(
  '/:alarmId/check',
  authenticate(),
  withAsync(checkNotification),
);
