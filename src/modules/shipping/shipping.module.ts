import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  getShipping,
  autoProgressShipping,
  updateShippingStatus,
} from './shipping.controller';

export const shippingRouter = Router();

/**
 * @swagger
 * /api/shipping/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: 배송 정보 조회
 *     description: 주문의 배송 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: 주문 ID
 *     responses:
 *       200:
 *         description: 배송 정보 반환
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 배송 정보를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
shippingRouter.get('/:orderId', authenticate(), withAsync(getShipping));

/**
 * @swagger
 * /api/shipping/{orderId}/auto-progress:
 *   post:
 *     tags: [Orders]
 *     summary: 배송 상태 자동 진행 (테스트용)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: 주문 ID
 *     responses:
 *       200:
 *         description: 배송 상태 자동 진행 성공
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
shippingRouter.post(
  '/:orderId/auto-progress',
  authenticate(),
  withAsync(autoProgressShipping),
);

/**
 * @swagger
 * /api/shipping/{orderId}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: 배송 상태 업데이트
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: 주문 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PREPARING, SHIPPING, DELIVERED]
 *                 description: 배송 상태
 *     responses:
 *       200:
 *         description: 배송 상태 업데이트 성공
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
shippingRouter.patch(
  '/:orderId/status',
  authenticate(),
  withAsync(updateShippingStatus),
);
