import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { create, deleteUser, getLikedStores, getMe, updateMe } from './users.controller';
import { usersUpload } from './users.upload';

export const usersRouter = Router();

usersRouter.post('/', withAsync(create));
usersRouter.get('/me', authenticate(), withAsync(getMe));
usersRouter.patch('/me', authenticate(), usersUpload, withAsync(updateMe));
usersRouter.delete('/delete', authenticate(), withAsync(deleteUser));
usersRouter.get('/me/likes', authenticate(), withAsync(getLikedStores));
