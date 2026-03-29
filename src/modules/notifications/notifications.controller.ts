import type { Response } from 'express';
import { create as structCreate } from 'superstruct';
import { requireAuthUser } from '../../lib/request/auth-user';
import type { AuthenticatedRequest } from '../../middlewares/authenticate';
import { notificationsService } from './notifications.service';
import {
  AlarmParamsStruct,
  NotificationsQueryStruct,
} from './structs/notifications.struct';
import type { NotificationsQuery } from './types/notifications.type';

export async function findMyNotifications(
  req: AuthenticatedRequest,
  res: Response,
) {
  const authUser = requireAuthUser(req);
  const query: NotificationsQuery = structCreate(
    req.query,
    NotificationsQueryStruct,
  );
  const notifications = await notificationsService.findMyNotifications(
    authUser,
    query,
  );
  res.send(notifications);
}

export async function connectNotificationsSse(
  req: AuthenticatedRequest,
  res: Response,
) {
  const authUser = requireAuthUser(req);
  notificationsService.connectSse(authUser, res);
}

export async function checkNotification(
  req: AuthenticatedRequest,
  res: Response,
) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, AlarmParamsStruct);
  const notification = await notificationsService.checkNotification(
    authUser,
    params.alarmId,
  );
  res.send(notification);
}
