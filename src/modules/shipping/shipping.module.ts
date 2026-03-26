import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  getShipping,
  autoProgressShipping,
  updateShippingStatus,
} from './shipping.controller';

export const shippingRouter = Router();

// 배송 정보 조회 GET /api/shipping/:orderId
shippingRouter.get('/:orderId', authenticate(), withAsync(getShipping));

// ✅ 배송 상태 자동 진행 POST /api/shipping/:orderId/auto-progress (테스트용)
shippingRouter.post(
  '/:orderId/auto-progress',
  authenticate(),
  withAsync(autoProgressShipping),
);

// 배송 상태 업데이트 PATCH /api/shipping/:orderId/status
shippingRouter.patch(
  '/:orderId/status',
  authenticate(),
  withAsync(updateShippingStatus),
);
