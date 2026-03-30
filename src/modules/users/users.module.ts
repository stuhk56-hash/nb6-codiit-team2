import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import {
  create,
  deleteUser,
  getLikedStores,
  getMe,
  updateMe,
} from './users.controller';
import { usersUpload } from './users.upload';

export const usersRouter = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [User]
 *     summary: 회원가입
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 김유저
 *               email:
 *                 type: string
 *                 example: user01@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               type:
 *                 type: string
 *                 example: BUYER
 *     responses:
 *       201:
 *         description: 회원 가입 성공한 유저의 값을 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       409:
 *         description: 이미 존재하는 유저입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorConflict'
 */
usersRouter.post('/', withAsync(create));

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [User]
 *     summary: 내 정보 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 정보 조회 성공 및 유저 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: 유저 정보 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 유저를 찾을 수 없습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
usersRouter.get('/me', authenticate(), withAsync(getMe));

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     tags: [User]
 *     summary: 내 정보 수정
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [currentPassword]
 *             properties:
 *               name:
 *                 type: string
 *                 description: 이름
 *               password:
 *                 type: string
 *                 description: 변경할 비밀번호
 *               currentPassword:
 *                 type: string
 *                 description: 현재 비밀번호
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 내 정보 수정 성공 및 수정된 유저 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: 존재하지 않는 유저 입니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 유저를 찾을 수 없습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
usersRouter.patch('/me', authenticate(), usersUpload, withAsync(updateMe));

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     tags: [User]
 *     summary: 회원 탈퇴
 *     description: 현재 로그인한 사용자의 계정을 삭제합니다
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *       400:
 *         description: 잘못된 요청입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 *       404:
 *         description: 존재하지 않는 유저 입니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 유저를 찾을 수 없습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
usersRouter.delete('/delete', authenticate(), withAsync(deleteUser));

/**
 * @swagger
 * /api/users/me/likes:
 *   get:
 *     tags: [User]
 *     summary: 관심 스토어 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 관심 스토어 조회 성공 및 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   storeId:
 *                     type: string
 *                     example: CUID
 *                   userId:
 *                     type: string
 *                     example: CUID
 *                   store:
 *                     $ref: '#/components/schemas/StoreResponse'
 *       404:
 *         description: 존재하지 않는 유저 입니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 유저를 찾을 수 없습니다.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: Not Found
 */
usersRouter.get('/me/likes', authenticate(), withAsync(getLikedStores));
