import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  createPayment,
  getPaymentByOrderId,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentsByStatus,
  cancelPayment,
} from './payment.controller';

export const paymentsRouter = Router();

paymentsRouter.post('/', authenticate(), withAsync(createPayment));

paymentsRouter.get(
  '/order/:orderId',
  authenticate(),
  withAsync(getPaymentByOrderId),
);

paymentsRouter.get(
  '/user/history',
  authenticate(),
  withAsync(getPaymentsByUserId),
);

paymentsRouter.patch(
  '/:orderId/cancel',
  authenticate(),
  withAsync(cancelPayment),
);

paymentsRouter.get('/:paymentId', authenticate(), withAsync(getPaymentById));

paymentsRouter.get('/', authenticate(), withAsync(getPaymentsByStatus));
