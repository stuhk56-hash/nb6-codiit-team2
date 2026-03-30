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

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Orders]
 *     summary: 결제 생성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: 주문 ID
 *     responses:
 *       201:
 *         description: 결제 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentDto'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
paymentsRouter.post('/', authenticate(), withAsync(createPayment));

/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: 주문별 결제 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 결제 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentDto'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 결제 정보를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
paymentsRouter.get(
  '/order/:orderId',
  authenticate(),
  withAsync(getPaymentByOrderId),
);

/**
 * @swagger
 * /api/payments/user/history:
 *   get:
 *     tags: [Orders]
 *     summary: 내 결제 내역 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 결제 내역 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaymentDto'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
paymentsRouter.get(
  '/user/history',
  authenticate(),
  withAsync(getPaymentsByUserId),
);

/**
 * @swagger
 * /api/payments/{orderId}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: 결제 취소
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 결제 취소 성공
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 결제 정보를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
paymentsRouter.patch(
  '/:orderId/cancel',
  authenticate(),
  withAsync(cancelPayment),
);

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     tags: [Orders]
 *     summary: 결제 상세 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 결제 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentDto'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 결제 정보를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
paymentsRouter.get('/:paymentId', authenticate(), withAsync(getPaymentById));

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Orders]
 *     summary: 결제 상태별 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 결제 상태 필터
 *     responses:
 *       200:
 *         description: 결제 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaymentDto'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
paymentsRouter.get('/', authenticate(), withAsync(getPaymentsByStatus));
