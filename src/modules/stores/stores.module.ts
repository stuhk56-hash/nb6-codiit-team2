import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { storesUpload } from './store.upload';
import {
  create,
  favoriteStoreDelete,
  favoriteStoreRegister,
  findStore,
  myStore,
  myStoreProduct,
  update,
} from './stores.controller';

export const storesRouter = Router();

/**
 * @swagger
 * /api/stores:
 *   post:
 *     tags: [Store]
 *     summary: 새 스토어 등록
 *     description: 내 스토어를 등록합니다 (1개만 가능)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, address, detailAddress, phoneNumber, content]
 *             properties:
 *               name:
 *                 type: string
 *                 description: 스토어 이름
 *               address:
 *                 type: string
 *                 description: 주소
 *               detailAddress:
 *                 type: string
 *                 description: 상세 주소
 *               phoneNumber:
 *                 type: string
 *                 description: 전화번호
 *               content:
 *                 type: string
 *                 description: 내용
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 이미지 파일 업로드
 *     responses:
 *       201:
 *         description: 등록된 스토어 정보를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreResponse'
 */
storesRouter.post('/', authenticate(), storesUpload, withAsync(create));

/**
 * @swagger
 * /api/stores/detail/my:
 *   get:
 *     tags: [Store]
 *     summary: 내 스토어 상세 조회
 *     description: 내 스토어 상세 조회입니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 스토어 정보를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: CUID
 *                 name:
 *                   type: string
 *                   example: CODI-IT
 *                 createdAt:
 *                   type: string
 *                   example: "2025-06-01T12:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   example: "2025-06-01T13:00:00.000Z"
 *                 userId:
 *                   type: string
 *                   example: CUID
 *                 address:
 *                   type: string
 *                   example: 서울특별시 강남구 테헤란로 123
 *                 detailAddress:
 *                   type: string
 *                   example: 1동 1106호
 *                 phoneNumber:
 *                   type: string
 *                   example: 010-1234-5678
 *                 content:
 *                   type: string
 *                   example: 저희는 CODI-IT 입니다.
 *                 image:
 *                   type: string
 *                   example: https://example.com/image.jpg
 *                 productCount:
 *                   type: number
 *                   example: 32
 *                 favoriteCount:
 *                   type: number
 *                   example: 4382
 *                 monthFavoriteCount:
 *                   type: number
 *                   example: 300
 *                 totalSoldCount:
 *                   type: number
 *                   example: 5000
 */
storesRouter.get('/detail/my', authenticate(), withAsync(myStore));

/**
 * @swagger
 * /api/stores/detail/my/product:
 *   get:
 *     tags: [Store]
 *     summary: 내 스토어 등록 상품 조회
 *     description: 내 스토어 등록 상품 조회입니다.
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
 *           default: 10
 *         description: 페이지 리스트 갯수
 *     responses:
 *       200:
 *         description: 스토어 등록 상품 정보를 반환합니다.
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
 *                         example: CUID
 *                       image:
 *                         type: string
 *                         example: https://example.com/image.jpg
 *                       name:
 *                         type: string
 *                         example: 가디건
 *                       price:
 *                         type: number
 *                         example: 29900
 *                       stock:
 *                         type: number
 *                         example: 10
 *                       isDiscount:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         example: "2026-03-23T03:16:39.477Z"
 *                       isSoldOut:
 *                         type: boolean
 *                         example: false
 *                 totalCount:
 *                   type: number
 *                   example: 32
 */
storesRouter.get(
  '/detail/my/product',
  authenticate(),
  withAsync(myStoreProduct),
);

/**
 * @swagger
 * /api/stores/{storeId}:
 *   patch:
 *     tags: [Store]
 *     summary: 스토어 수정
 *     description: 내 스토어 정보 수정입니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 수정할 스토어 ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 스토어 이름
 *               address:
 *                 type: string
 *                 description: 주소
 *               detailAddress:
 *                 type: string
 *                 description: 상세 주소
 *               phoneNumber:
 *                 type: string
 *                 description: 전화번호
 *               content:
 *                 type: string
 *                 description: 내용
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 이미지 파일 업로드
 *     responses:
 *       200:
 *         description: 수정된 스토어 정보를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreResponse'
 */
storesRouter.patch(
  '/:storeId',
  authenticate(),
  storesUpload,
  withAsync(update),
);

/**
 * @swagger
 * /api/stores/{storeId}:
 *   get:
 *     tags: [Store]
 *     summary: 스토어 상세 조회
 *     description: 스토어 상세 조회입니다.
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 스���어 ID
 *     responses:
 *       200:
 *         description: 스토어 정보를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: CUID
 *                 name:
 *                   type: string
 *                   example: CODI-IT
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 userId:
 *                   type: string
 *                   example: CUID
 *                 address:
 *                   type: string
 *                   example: 서울특별시 강남구 테헤란로 123
 *                 detailAddress:
 *                   type: string
 *                   example: 1동 1106호
 *                 phoneNumber:
 *                   type: string
 *                   example: 010-1234-5678
 *                 content:
 *                   type: string
 *                   example: 저희는 CODI-IT 입니다.
 *                 image:
 *                   type: string
 *                   example: https://example.com/image.jpg
 *                 favoriteCount:
 *                   type: number
 *                   example: 4382
 */
storesRouter.get('/:storeId', withAsync(findStore));

/**
 * @swagger
 * /api/stores/{storeId}/favorite:
 *   post:
 *     tags: [Store]
 *     summary: 관심 스토어 등록
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 관심 스토어 ID
 *     responses:
 *       201:
 *         description: 관심 스토어 등록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: register
 *                 store:
 *                   $ref: '#/components/schemas/StoreResponse'
 */
storesRouter.post(
  '/:storeId/favorite',
  authenticate(),
  withAsync(favoriteStoreRegister),
);

/**
 * @swagger
 * /api/stores/{storeId}/favorite:
 *   delete:
 *     tags: [Store]
 *     summary: 관심 스토어 해제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 관심 스토어 ID
 *     responses:
 *       200:
 *         description: 관심 스토어 해제
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: delete
 *                 store:
 *                   $ref: '#/components/schemas/StoreResponse'
 */
storesRouter.delete(
  '/:storeId/favorite',
  authenticate(),
  withAsync(favoriteStoreDelete),
);
