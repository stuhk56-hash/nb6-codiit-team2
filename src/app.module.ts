import { Express } from 'express';
import { authRouter } from './modules/auth/auth.module';
import { usersRouter } from './modules/users/users.module';

export function setupRoutes(app: Express) {
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
}
