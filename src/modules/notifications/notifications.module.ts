import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  checkNotification,
  connectNotificationsSse,
  findMyNotifications,
} from './notifications.controller';

export const notificationsRouter = Router();

/**
 * @swagger
 * /api/notifications/sse:
 *   get:
 *     tags: [Alarm]
 *     summary: 실시간 알람 SSE
 *     description: 30초마다 실시간 알람을 SSE로 전송합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 실시간 알람 스트림
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AlarmDto'
 */
notificationsRouter.get(
  '/sse',
  authenticate(),
  withAsync(connectNotificationsSse),
);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Alarm]
 *     summary: 알람 조회(UserType에 따른 알람 조회)
 *     description: 유저 타입에 따라 알람을 조회합니다
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: 페이지 번호 (기본값 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *           default: 10
 *         description: 페이지 크기 (기본값 10)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [oldest, recent]
 *         description: 정렬 옵션 (선택 안하면 최신순 조회)
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, unChecked, checked]
 *         description: 필터 옵션 (선택 안하면 모든 상태 조회)
 *     responses:
 *       200:
 *         description: 알람 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AlarmDto'
 *                 totalCount:
 *                   type: number
 *                   example: 100
 *       400:
 *         description: 잘못된 요청입니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 인증 실패했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: 사용자를 찾지 못했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       404:
 *         description: 알람을 찾지 못했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
notificationsRouter.get('/', authenticate(), withAsync(findMyNotifications));

/**
 * @swagger
 * /api/notifications/{alarmId}/check:
 *   patch:
 *     tags: [Alarm]
 *     summary: 알람 읽음 처리
 *     description: 알람을 읽음 처리합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alarmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 알람 읽음 처리 완료
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlarmDto'
 *       400:
 *         description: 잘못된 요청입니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 인증 실패했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       403:
 *         description: 사용자를 찾지 못했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorForbidden'
 *       404:
 *         description: 해당 알람이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
notificationsRouter.patch(
  '/:alarmId/check',
  authenticate(),
  withAsync(checkNotification),
);
