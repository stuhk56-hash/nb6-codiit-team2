import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  getOrders,
  getOrdersById,
  createOrder,
  updateOrder,
  cancelOrder,
} from './orders.controller';

export const ordersRouter = Router();

ordersRouter.get('/', authenticate(), withAsync(getOrders));
ordersRouter.post('/', authenticate(), withAsync(createOrder));
ordersRouter.get('/:orderId', authenticate(), withAsync(getOrdersById));
ordersRouter.patch('/:orderId', authenticate(), withAsync(updateOrder));
ordersRouter.delete('/:orderId', authenticate(), withAsync(cancelOrder));
