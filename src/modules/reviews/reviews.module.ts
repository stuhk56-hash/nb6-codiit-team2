import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  createReview,
  deleteReview,
  findProductReviews,
  findReviewDetail,
  updateReview,
} from './reviews.controller';

export const reviewsRouter = Router();
export const productReviewsRouter = Router();

/**
 * @swagger
 * /api/review/{reviewId}:
 *   get:
 *     tags: [Review]
 *     summary: 리뷰 상세 조회(리뷰Id)
 *     description: 리뷰 ID를 사용하여 리뷰의 상세 정보를 조회합니다. 리뷰 작성자, 내용, 평점 등의 정보를 포함합니다.
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 리뷰 ID
 *         example: review1
 *     responses:
 *       200:
 *         description: 리뷰 상세 정보 조회에 성공했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviewId:
 *                   type: string
 *                 productName:
 *                   type: string
 *                 size:
 *                   type: object
 *                   properties:
 *                     en:
 *                       type: string
 *                     ko:
 *                       type: string
 *                 price:
 *                   type: number
 *                 quantity:
 *                   type: number
 *                 rating:
 *                   type: number
 *                 content:
 *                   type: string
 *                 reviewer:
 *                   type: string
 *                 reviewCreatedAt:
 *                   type: string
 *                 purchasedAt:
 *                   type: string
 *       401:
 *         description: 인증에 실패했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 리뷰를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
reviewsRouter.get('/:reviewId', withAsync(findReviewDetail));

/**
 * @swagger
 * /api/review/{reviewId}:
 *   patch:
 *     tags: [Review]
 *     summary: 리뷰 수정(리뷰ID)
 *     description: 리뷰 ID를 사용하여 리뷰를 수정합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: 수정할 리뷰 ID
 *         example: review1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 리뷰를 수정했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponseDto'
 *       401:
 *         description: 사용자를 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 리뷰를 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
reviewsRouter.patch('/:reviewId', authenticate(), withAsync(updateReview));

/**
 * @swagger
 * /api/review/{reviewId}:
 *   delete:
 *     tags: [Review]
 *     summary: 리뷰 삭제(리뷰Id)
 *     description: 리뷰 ID를 사용하여 리뷰를 삭제합니다. 삭제된 리뷰는 더 이상 조회할 수 없습니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 리뷰 ID
 *         example: review1
 *     responses:
 *       204:
 *         description: 리뷰를 삭제 했습니다
 *       401:
 *         description: 사용자를 찾지 못했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 리뷰를 찾지 못했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
reviewsRouter.delete('/:reviewId', authenticate(), withAsync(deleteReview));

/**
 * @swagger
 * /api/product/{productId}/reviews:
 *   post:
 *     tags: [Review]
 *     summary: 상품 리뷰 작성(ProductID)
 *     description: 상품 ID를 사용하여 리뷰를 작성합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, content, orderItemId]
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 5
 *               content:
 *                 type: string
 *                 example: 이 상품 정말 좋아요!
 *               orderItemId:
 *                 type: string
 *                 example: orderItemId123
 *     responses:
 *       201:
 *         description: 리뷰를 작성했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponseDto'
 *       401:
 *         description: 사용자를 찾지 못했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 상품을 찾지 못했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
productReviewsRouter.post(
  '/:productId/reviews',
  authenticate(),
  withAsync(createReview),
);

/**
 * @swagger
 * /api/product/{productId}/reviews:
 *   get:
 *     tags: [Review]
 *     summary: 상품 리뷰 목록 조회(페이지네이션 포함/ProducId)
 *     description: 상품 ID를 사용하여 해당 상품의 리뷰 목록을 페이지네이션과 함께 조회합니다.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 5
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *     responses:
 *       200:
 *         description: 상품 리뷰 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReviewResponseDto'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     hasNextPage:
 *                       type: boolean
 *       401:
 *         description: 사용자를 찾지 못했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 리뷰를 찾지 못했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
productReviewsRouter.get('/:productId/reviews', withAsync(findProductReviews));
