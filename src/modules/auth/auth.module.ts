import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { login, logout, refresh } from './auth.controller';

export const authRouter = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 로그인 및 Access/Refresh 토큰 발급
 *     description: 사용자의 이메일과 비밀번호로 로그인하고, Access Token과 Refresh Token을 발급합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: buyer@codiit.com
 *               password:
 *                 type: string
 *                 example: test1234
 *     responses:
 *       201:
 *         description: 로그인 성공했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: abcd1234
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: TestUser
 *                     type:
 *                       type: string
 *                       example: BUYER
 *                     points:
 *                       type: string
 *                       example: "1000"
 *                     image:
 *                       type: string
 *                       example: string
 *                     grade:
 *                       $ref: '#/components/schemas/GradeResponse'
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: 잘못된 요청입니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: 로그인 실패했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: 이메일 또는 비밀번호가 올바르지 않습니다.
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: 사용자를 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFound'
 */
authRouter.post('/login', withAsync(login));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh Token으로 Access Token 재발급
 *     description: 유효한 Refresh Token을 사용하여 새로운 Access Token을 발급합니다.
 *     responses:
 *       200:
 *         description: Access Token 재발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: 잘못된 요청입니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorBadRequest'
 *       401:
 *         description: Unauthorized - 유효하지 않거나 만료된 Refresh Token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
authRouter.post('/refresh', withAsync(refresh));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: 로그아웃
 *     description: 로그인된 사용자의 세션(리프레시 토큰)을 제거합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 성공적으로 로그아웃되었습니다.
 *       401:
 *         description: 인증되지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorized'
 */
authRouter.post('/logout', authenticate(), withAsync(logout));
