import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { login, logout, refresh } from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', withAsync(login));
authRouter.post('/refresh', withAsync(refresh));
authRouter.post('/logout', authenticate(), withAsync(logout));
