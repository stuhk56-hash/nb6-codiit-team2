import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  createCart,
  getCart,
  updateCart,
  getCartItemDetail,
  deleteCartItem,
} from './cart.controller';

export const cartRouter = Router();

/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: 장바구니 생성
 *     description: 구매자의 장바구니를 생성합니다. 이미 존재하는 경우 해당 장바구니를 반환합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 장바구니가 성공적으로 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: cart1
 *                 buyerId:
 *                   type: string
 *                   example: buyer
 *                 createdAt:
 *                   type: string
 *                   example: "2025-06-02T07:44:08.294Z"
 *                 updatedAt:
 *                   type: string
 *                   example: "2025-06-02T07:44:08.294Z"
 *       400:
 *         description: 잘못된 요청입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 인증에 실패했습니다.
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
 */
cartRouter.post('/', authenticate(), withAsync(createCart));

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: 장바구니 조회
 *     description: 사용자의 장바구니를 조회합니다. 장바구니의 아이템이 없으면 빈 배열을 반환합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 장바구니가 성공적으로 조회되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 buyerId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       cartId:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       sizeId:
 *                         type: number
 *                       quantity:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           storeId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           image:
 *                             type: string
 *                           discountRate:
 *                             type: number
 *                           discountStartTime:
 *                             type: string
 *                           discountEndTime:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                           reviewsRating:
 *                             type: number
 *                           categoryId:
 *                             type: string
 *                           content:
 *                             type: string
 *                           isSoldOut:
 *                             type: boolean
 *                           store:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               userId:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               address:
 *                                 type: string
 *                               phoneNumber:
 *                                 type: string
 *                               content:
 *                                 type: string
 *                               image:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                               updatedAt:
 *                                 type: string
 *                               detailAddress:
 *                                 type: string
 *                           stocks:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 productId:
 *                                   type: string
 *                                 sizeId:
 *                                   type: number
 *                                 quantity:
 *                                   type: number
 *                                 size:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: number
 *                                     size:
 *                                       type: object
 *                                       properties:
 *                                         en:
 *                                           type: string
 *                                         ko:
 *                                           type: string
 *                                     name:
 *                                       type: string
 *       400:
 *         description: 잘못된 요청입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 인증에 실패했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: 권한이 없습니다. (구매자만 조회 가능)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       404:
 *         description: 장바구니가 존재하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
cartRouter.get('/', authenticate(), withAsync(getCart));

/**
 * @swagger
 * /api/cart:
 *   patch:
 *     tags: [Cart]
 *     summary: 장바구니 수정(아이템 추가/아이템 수량 수정)
 *     description: 상품을 추가하거나 수량을 수정합니다
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, sizes]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: product1
 *               sizes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sizeId:
 *                       type: number
 *                       example: 1
 *                     quantity:
 *                       type: number
 *                       example: 3
 *     responses:
 *       200:
 *         description: 장바구니가 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   cartId:
 *                     type: string
 *                   productId:
 *                     type: string
 *                   sizeId:
 *                     type: number
 *                   quantity:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       400:
 *         description: 잘못된 요청입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 인증이 필요합니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: 권한이 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 */
cartRouter.patch('/', authenticate(), withAsync(updateCart));

/**
 * @swagger
 * /api/cart/{cartItemId}:
 *   get:
 *     tags: [Cart]
 *     summary: 장바구니 아이템 상세 조회(카트 아이템 ID)
 *     description: 장바구니에서 특정 아이템의 상세 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 장바구니 아이템 상세 조회에 성공했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 cartId:
 *                   type: string
 *                 productId:
 *                   type: string
 *                 sizeId:
 *                   type: number
 *                 quantity:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     storeId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     image:
 *                       type: string
 *                     discountRate:
 *                       type: number
 *                     discountStartTime:
 *                       type: string
 *                     discountEndTime:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                 cart:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     buyerId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: 인증에 실패했습니다.
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
 *         description: 장바구니에 아이템이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
cartRouter.get('/:cartItemId', authenticate(), withAsync(getCartItemDetail));

/**
 * @swagger
 * /api/cart/{cartItemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: 장바구니 아이템 삭제(카트 아이템 ID)
 *     description: 장바구니에서 특정 아이템을 삭제합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 장바구니 아이템 ID
 *     responses:
 *       204:
 *         description: 삭제에 성공했습니다
 *       401:
 *         description: 인증에 실패했습니다.
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
 *         description: 장바구니에 아이템이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
cartRouter.delete('/:cartItemId', authenticate(), withAsync(deleteCartItem));
