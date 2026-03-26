import { Express } from 'express';
import { authRouter } from './modules/auth/auth.module';
import { metadataRouter } from './modules/metadata/metadata.module';
import { usersRouter } from './modules/users/users.module';
import { ordersRouter } from './modules/orders/orders.module';
import { cartRouter } from './modules/cart/cart.module';
import { s3Router } from './modules/s3/s3.module';
import { productsRouter } from './modules/products/products.module';
import { inquiriesRouter } from './modules/inquiries/inquiries.module';
import { dashboardRouter } from './modules/dashboard/dashboard.module';
import { notificationsRouter } from './modules/notifications/notifications.module';
import {
  productReviewsRouter,
  reviewsRouter,
} from './modules/reviews/reviews.module';
import { paymentsRouter } from './modules/payments/payment.module';
import { shippingRouter } from './modules/shipping/shipping.module';
import { storesRouter } from './modules/stores/stores.module';

export function setupRoutes(app: Express) {
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/inquiries', inquiriesRouter);
  app.use('/api/product', productReviewsRouter);
  app.use('/api/review', reviewsRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/metadata', metadataRouter);
  app.use('/api/s3', s3Router);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/shipping', shippingRouter);
  app.use('/api/stores', storesRouter);
}
