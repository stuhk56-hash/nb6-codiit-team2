import { Express } from 'express';
import { authRouter } from './modules/auth/auth.module';
import { metadataRouter } from './modules/metadata/metadata.module';
import { usersRouter } from './modules/users/users.module';
import { ordersRouter } from './modules/orders/orders.module';
import { cartRouter } from './modules/cart/cart.module';

export function setupRoutes(app: Express) {
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/metadata', metadataRouter);
}
