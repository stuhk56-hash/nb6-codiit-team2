import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  create,
  createInquiry,
  findList,
  findProduct,
  getListInquiry,
  remove,
  update,
} from './products.controller';
import { productsUpload } from './products.upload';

export const productsRouter = Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Product]
 *     summary: 새 상품 등록
 *     description: 상품 등록
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price, categoryName, stocks]
 *             properties:
 *               name:
 *                 type: string
 *                 description: 상품 이름
 *               price:
 *                 type: number
 *                 description: 정가
 *               content:
 *                 type: string
 *                 description: 상품 상세 설명
 *               categoryName:
 *                 type: string
 *                 description: 카테고리 이름
 *               stocks:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: 사이즈 별 재고
 *               discountRate:
 *                 type: number
 *                 description: 할인율
 *               discountStartTime:
 *                 type: string
 *                 description: 할인 시작 날짜
 *               discountEndTime:
 *                 type: string
 *                 description: 할인 종료 날짜
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 이미지 파일 업로드
 *     responses:
 *       201:
 *         description: 등록된 상품 정보를 반환합니다.
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
 *                   example: 가디건
 *                 image:
 *                   type: string
 *                   example: https://s3-URL
 *                 content:
 *                   type: string
 *                   example: 상품 상세 설명
 *                 createdAt:
 *                   type: string
 *                   example: "2025-06-01T00:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   example: "2025-06-02T00:00:00Z"
 *                 reviewsRating:
 *                   type: number
 *                   example: 4.5
 *                 storeId:
 *                   type: string
 *                   example: CUID
 *                 storeName:
 *                   type: string
 *                   example: 하이버
 *                 price:
 *                   type: number
 *                   example: 20000
 *                 discountPrice:
 *                   type: number
 *                   example: 18000
 *                 discountRate:
 *                   type: number
 *                   example: 10
 *                 discountStartTime:
 *                   type: string
 *                   example: "2025-05-28T12:34:56Z"
 *                 discountEndTime:
 *                   type: string
 *                   example: "2025-05-30T12:34:56Z"
 *                 reviewsCount:
 *                   type: number
 *                   example: 32
 *                 reviews:
 *                   type: object
 *                   properties:
 *                     rate1Length:
 *                       type: number
 *                       example: 0
 *                     rate2Length:
 *                       type: number
 *                       example: 0
 *                     rate3Length:
 *                       type: number
 *                       example: 0
 *                     rate4Length:
 *                       type: number
 *                       example: 0
 *                     rate5Length:
 *                       type: number
 *                       example: 0
 *                     sumScore:
 *                       type: number
 *                       example: 0
 *                 inquiries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InquiryResponse'
 *                 categoryId:
 *                   type: string
 *                   example: CUID
 *                 category:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: bottom
 *                     id:
 *                       type: string
 *                       example: CUID
 *                 stocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: CUID
 *                       productId:
 *                         type: string
 *                         example: CUID
 *                       quantity:
 *                         type: number
 *                         example: 3
 *                       size:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: L
 *                 isSoldOut:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: 이미 상품이 존재합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       404:
 *         description: 스토어를 찾을 수 없습니다. | 카테고리가 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
productsRouter.post('/', authenticate(), productsUpload, withAsync(create));

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Product]
 *     summary: 상품 목록 조회
 *     description: 페이징, 검색, 정렬이 가능합니다.
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
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색할 단어
 *         example: 가디건
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [mostReviewed, recent, lowPrice, highPrice, highRating, salesRanking]
 *         description: 정렬 옵션
 *         example: mostReviewed
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *         description: 가격 조회 (price 값 min)
 *         example: 0
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *         description: 가격 조회 (price 값 max)
 *         example: 20000
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: 사이즈 이름
 *         example: L
 *       - in: query
 *         name: favoriteStore
 *         schema:
 *           type: string
 *         description: 스토어 ID
 *         example: CUID
 *       - in: query
 *         name: categoryName
 *         schema:
 *           type: string
 *         description: 카테고리 이름
 *         example: bottom
 *     responses:
 *       200:
 *         description: 상품 리스트 및 메타정보 반환
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
 *                       storeId:
 *                         type: string
 *                         example: CUID
 *                       storeName:
 *                         type: string
 *                         example: 무신사
 *                       name:
 *                         type: string
 *                         example: 가디건
 *                       image:
 *                         type: string
 *                         example: https://example.com/image.jpg
 *                       price:
 *                         type: number
 *                         example: 20000
 *                       discountPrice:
 *                         type: number
 *                         example: 18000
 *                       discountRate:
 *                         type: number
 *                         example: 10
 *                       discountStartTime:
 *                         type: string
 *                         example: "2025-06-01T00:00:00Z"
 *                       discountEndTime:
 *                         type: string
 *                         example: "2025-06-10T00:00:00Z"
 *                       reviewsCount:
 *                         type: number
 *                         example: 5
 *                       reviewsRating:
 *                         type: number
 *                         example: 4.5
 *                       createdAt:
 *                         type: string
 *                         example: "2025-06-01T12:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         example: "2025-06-02T12:00:00Z"
 *                       sales:
 *                         type: number
 *                         example: 30
 *                       isSoldOut:
 *                         type: boolean
 *                         example: true
 *                 totalCount:
 *                   type: number
 *                   example: 340
 *       404:
 *         description: 상품을 찾을 수 없습니다. | 카테고리가 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
productsRouter.get('/', withAsync(findList));

/**
 * @swagger
 * /api/products/{productId}:
 *   patch:
 *     tags: [Product]
 *     summary: 상품 수정
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 상품 ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [id, stocks]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 상품 ID
 *               name:
 *                 type: string
 *                 description: 상품 이름
 *               price:
 *                 type: number
 *                 description: 정가
 *               content:
 *                 type: string
 *                 description: 상품 상세 설명
 *               categoryName:
 *                 type: string
 *                 description: 카테고리 이름
 *               stocks:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: 사이즈 별 재고
 *               discountRate:
 *                 type: number
 *                 description: 할인율
 *               discountStartTime:
 *                 type: string
 *                 description: 할인 시작 날짜
 *               discountEndTime:
 *                 type: string
 *                 description: 할인 종료 날짜
 *               isSoldOut:
 *                 type: boolean
 *                 description: 매진 여부
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 이미지 파일 업로드
 *     responses:
 *       200:
 *         description: 수정된 상품 정보 반환합니다
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
 *                   example: 가디건
 *                 image:
 *                   type: string
 *                   example: https://s3-URL
 *                 content:
 *                   type: string
 *                   example: 상품 상세 설명
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 reviewsRating:
 *                   type: number
 *                   example: 4.5
 *                 storeId:
 *                   type: string
 *                   example: CUID
 *                 storeName:
 *                   type: string
 *                   example: 하이버
 *                 price:
 *                   type: number
 *                   example: 20000
 *                 discountPrice:
 *                   type: number
 *                   example: 18000
 *                 discountRate:
 *                   type: number
 *                   example: 10
 *                 isSoldOut:
 *                   type: boolean
 *                   example: false
 *       404:
 *         description: 상품을 찾을 수 없습니다. | 카테고리가 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
productsRouter.patch(
  '/:productId',
  authenticate(),
  productsUpload,
  withAsync(update),
);

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     tags: [Product]
 *     summary: 상품 정보 조회
 *     description: 상품 정보 조회
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 상품 ID
 *         example: CUID
 *     responses:
 *       200:
 *         description: 상품 정보 및 메타정보 반환
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
 *                   example: 가디건
 *                 image:
 *                   type: string
 *                   example: https://s3-URL
 *                 content:
 *                   type: string
 *                   example: 상품 상세 설명
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 reviewsRating:
 *                   type: number
 *                   example: 4.5
 *                 storeId:
 *                   type: string
 *                   example: CUID
 *                 storeName:
 *                   type: string
 *                   example: 하이버
 *                 price:
 *                   type: number
 *                   example: 20000
 *                 discountPrice:
 *                   type: number
 *                   example: 18000
 *                 discountRate:
 *                   type: number
 *                   example: 10
 *                 reviewsCount:
 *                   type: number
 *                   example: 32
 *                 reviews:
 *                   type: object
 *                   properties:
 *                     rate1Length:
 *                       type: number
 *                     rate2Length:
 *                       type: number
 *                     rate3Length:
 *                       type: number
 *                     rate4Length:
 *                       type: number
 *                     rate5Length:
 *                       type: number
 *                     sumScore:
 *                       type: number
 *                 inquiries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InquiryResponse'
 *                 categoryId:
 *                   type: string
 *                 category:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: bottom
 *                     id:
 *                       type: string
 *                       example: CUID
 *                 stocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       size:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                 isSoldOut:
 *                   type: boolean
 *                   example: false
 *       404:
 *         description: 상품을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
productsRouter.get('/:productId', withAsync(findProduct));

/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     tags: [Product]
 *     summary: 상품 삭제
 *     description: 본인이 소유한 상품을 삭제합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 상품 ID
 *         example: CUID
 *     responses:
 *       204:
 *         description: 상품이 정상적으로 삭제되었습니다.
 *       403:
 *         description: 상품 삭제 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
productsRouter.delete('/:productId', authenticate(), withAsync(remove));

/**
 * @swagger
 * /api/products/{productId}/inquiries:
 *   post:
 *     tags: [Product]
 *     summary: 상품 문의 등록
 *     description: 상품에 대한 문의를 등록합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 Id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
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
 *       201:
 *         description: 상품 문의를 만들고 생성된 문의 정보를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InquiryResponse'
 *       404:
 *         description: 상품을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
productsRouter.post(
  '/:productId/inquiries',
  authenticate(),
  withAsync(createInquiry),
);

/**
 * @swagger
 * /api/products/{productId}/inquiries:
 *   get:
 *     tags: [Product]
 *     summary: 상품 문의 조회
 *     description: 상품에 대한 모든 문의를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [WaitingAnswer, CompletedAnswer]
 *         description: 답변 상태 필터 (선택 안하면 모든 상태 조회)
 *     responses:
 *       200:
 *         description: 상품 문의 리스트를 반환합니다.
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
 *                       userId:
 *                         type: string
 *                         example: CUID
 *                       productId:
 *                         type: string
 *                         example: CUID
 *                       title:
 *                         type: string
 *                         example: 상품 문의
 *                       content:
 *                         type: string
 *                         example: 문의 내용입니다.
 *                       status:
 *                         type: string
 *                         example: CompletedAnswer
 *                       isSecret:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: 김유저
 *                       reply:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: CUID
 *                           inquiryId:
 *                             type: string
 *                             example: CUID
 *                           userId:
 *                             type: string
 *                             example: CUID
 *                           content:
 *                             type: string
 *                             example: 이 제품은 재입고 예정입니다.
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: 김유저
 *                 totalCount:
 *                   type: number
 *                   example: 900
 *       404:
 *         description: 상품을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 상품을 찾을 수 없습니다.
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
productsRouter.get('/:productId/inquiries', withAsync(getListInquiry));
