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

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: 주문 목록 조회(페이지네이션 포함)
 *     description: 로그인한 사용자의 모든 주문을 페이지네이션 포함하여 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CompletedPayment]
 *         description: 주문 상태 필터링 (예 CompletedPayment)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 3
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: 페이지 번호
 *     responses:
 *       200:
 *         description: 주문 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderResponseDto'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 15
 *                     page:
 *                       type: number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       example: 10
 *                     totalPages:
 *                       type: number
 *                       example: 2
 *       401:
 *         description: 인증을 실패 했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: 권한이 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       404:
 *         description: 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
ordersRouter.get('/', authenticate(), withAsync(getOrders));

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: 주문 생성
 *     description: 사용자가 장바구니에 담은 상품으로 주문을 생성합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, address, orderItems]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 김유저
 *               phone:
 *                 type: string
 *                 example: 010-1234-5678
 *               address:
 *                 type: string
 *                 example: 서울특별시 강남구
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: product1
 *                     sizeId:
 *                       type: number
 *                       example: 1
 *                     quantity:
 *                       type: number
 *                       example: 2
 *               usePoint:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       201:
 *         description: 주문 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponseDto'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
ordersRouter.post('/', authenticate(), withAsync(createOrder));

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: 주문 상세 조회(OrderId)
 *     description: 특정 주문의 상세 정보를 조회합니다.
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
 *         description: 주문 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponseDto'
 *       400:
 *         description: 잘못된 요청입니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: 권한이 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       404:
 *         description: 주문은 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
ordersRouter.get('/:orderId', authenticate(), withAsync(getOrdersById));

/**
 * @swagger
 * /api/orders/{orderId}:
 *   patch:
 *     tags: [Orders]
 *     summary: 주문 정보 수정(이름/전화번호/배송지)
 *     description: 구매자 이름, 전화번호, 배송지를 수정합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 구매자
 *               phone:
 *                 type: string
 *                 example: 010-1234-5789
 *               address:
 *                 type: string
 *                 example: 서울특별시 강남구
 *     responses:
 *       200:
 *         description: 주문 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponseDto'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       404:
 *         description: 주문을 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
ordersRouter.patch('/:orderId', authenticate(), withAsync(updateOrder));

/**
 * @swagger
 * /api/orders/{orderId}:
 *   delete:
 *     tags: [Orders]
 *     summary: 주문 취소(OrderId)
 *     description: 주문을 취소합니다. 주문 상태가 "WaitingPayment"인 경우에만 취소할 수 있습니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: 취소할 주문 ID
 *         example: order1
 *     responses:
 *       200:
 *         description: 주문 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 주문이 성공적으로 취소되고 포인트가 복구되었습니다.
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 인증이 필요합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       404:
 *         description: 주문을 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
ordersRouter.delete('/:orderId', authenticate(), withAsync(cancelOrder));
