import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  deleteInquiry,
  findMyInquiries,
  findOneInquiry,
  replyCreate,
  replyUpdate,
  updateInquiry,
} from './inquiries.controller';

export const inquiriesRouter = Router();

/**
 * @swagger
 * /api/inquiries:
 *   get:
 *     tags: [Inquiry]
 *     summary: 내 문의 조회 (판매자,구매자 공용)
 *     description: 내 문의 리스트 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *           default: 16
 *         description: 페이지 리스트 갯수
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [WaitingAnswer, CompletedAnswer]
 *         description: 답변 상태
 *         example: CompletedAnswer
 *     responses:
 *       200:
 *         description: 내 문의 리스트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: cmbt09aqd00qwu4r84czhy7j9
 *                       title:
 *                         type: string
 *                         example: 사이즈 추천 부탁드려요
 *                       isSecret:
 *                         type: boolean
 *                         example: true
 *                       status:
 *                         type: string
 *                         example: CompletedAnswer
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: 편안한 조거 팬츠
 *                           image:
 *                             type: string
 *                             example: http://s3Url
 *                           store:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                                 example: 브랜디
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: 김유저
 *                       createdAt:
 *                         type: string
 *                       content:
 *                         type: string
 *                         example: 내용
 *                 totalCount:
 *                   type: number
 *                   example: 900
 */
inquiriesRouter.get('/', authenticate(), withAsync(findMyInquiries));

/**
 * @swagger
 * /api/inquiries/{inquiryId}:
 *   get:
 *     tags: [Inquiry]
 *     summary: 문의 상세 조회
 *     description: 문의 상세정보 조회했습니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 문의 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InquiryResponse'
 *       404:
 *         description: 문의가 존재하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 문의가 존재하지 않습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
inquiriesRouter.get('/:inquiryId', authenticate(), withAsync(findOneInquiry));

/**
 * @swagger
 * /api/inquiries/{inquiryId}:
 *   patch:
 *     tags: [Inquiry]
 *     summary: 문의 수정
 *     description: 문의를 수정 입니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
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
 *               title:
 *                 type: string
 *                 example: " 상품 문의합니다."
 *               content:
 *                 type: string
 *                 example: 문의 내용입니다.
 *               isSecret:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: 문의 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InquiryResponse'
 */
inquiriesRouter.patch('/:inquiryId', authenticate(), withAsync(updateInquiry));

/**
 * @swagger
 * /api/inquiries/{inquiryId}:
 *   delete:
 *     tags: [Inquiry]
 *     summary: 문의 삭제
 *     description: 문의를 삭제 했습니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 문의 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InquiryResponse'
 */
inquiriesRouter.delete('/:inquiryId', authenticate(), withAsync(deleteInquiry));

/**
 * @swagger
 * /api/inquiries/{inquiryId}/replies:
 *   post:
 *     tags: [Inquiry]
 *     summary: 문의 답변
 *     description: 문의 답변 생성입니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: 답변 내용입니다.
 *     responses:
 *       201:
 *         description: 문의 답변 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InquiryReplyResponse'
 */
inquiriesRouter.post(
  '/:inquiryId/replies',
  authenticate(),
  withAsync(replyCreate),
);

/**
 * @swagger
 * /api/inquiries/{replyId}/replies:
 *   patch:
 *     tags: [Inquiry]
 *     summary: 문의 답변 수정
 *     description: 문의 답변을 수정입니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: 답변 내용입니다.
 *     responses:
 *       200:
 *         description: 문의 답변 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InquiryReplyResponse'
 */
inquiriesRouter.patch(
  '/:replyId/replies',
  authenticate(),
  withAsync(replyUpdate),
);
