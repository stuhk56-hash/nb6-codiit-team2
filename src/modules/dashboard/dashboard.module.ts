import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { findDashboard } from './dashboard.controller';

export const dashboardRouter = Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: 대시보드 조회
 *     description: 대시보드 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대시보드 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 today:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 38
 *                         totalSales:
 *                           type: number
 *                           example: 15000000
 *                     previous:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 38
 *                         totalSales:
 *                           type: number
 *                           example: 15000000
 *                     changeRate:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 23
 *                         totalSales:
 *                           type: number
 *                           example: 20
 *                 week:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 38
 *                         totalSales:
 *                           type: number
 *                           example: 15000000
 *                     previous:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 38
 *                         totalSales:
 *                           type: number
 *                           example: 15000000
 *                     changeRate:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 23
 *                         totalSales:
 *                           type: number
 *                           example: 20
 *                 month:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 38
 *                         totalSales:
 *                           type: number
 *                           example: 15000000
 *                     previous:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 38
 *                         totalSales:
 *                           type: number
 *                           example: 15000000
 *                     changeRate:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 23
 *                         totalSales:
 *                           type: number
 *                           example: 20
 *                 year:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 38
 *                         totalSales:
 *                           type: number
 *                           example: 15000000
 *                     previous:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 38
 *                         totalSales:
 *                           type: number
 *                           example: 15000000
 *                     changeRate:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                           example: 23
 *                         totalSales:
 *                           type: number
 *                           example: 20
 *                 topSales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       totalOrders:
 *                         type: number
 *                         example: 215
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: product-cuid
 *                           name:
 *                             type: string
 *                             example: 스웨터
 *                           price:
 *                             type: number
 *                             example: 30000
 *                 priceRange:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       priceRange:
 *                         type: string
 *                         example: 만원 이하
 *                       totalSales:
 *                         type: number
 *                         example: 3505000
 *                       percentage:
 *                         type: number
 *                         example: 35.6
 */
dashboardRouter.get('/', authenticate(), withAsync(findDashboard));
