import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { uploadFile } from './s3.controller';
import { s3Upload } from './s3.upload';

export const s3Router = Router();

/**
 * @swagger
 * /api/s3/upload:
 *   post:
 *     tags: [S3 (이미지 업로드)]
 *     summary: s3 이미지 업로드 Api
 *     description: 이미지 업로드 url api
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 이미지 파일 업로드
 *     responses:
 *       201:
 *         description: 이미지 업로드 성공 (201 Created)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 업로드 성공
 *                 url:
 *                   type: string
 *                   example: s3File url
 *                 key:
 *                   type: string
 *                   example: s3File key
 */
s3Router.post('/upload', authenticate(), s3Upload, withAsync(uploadFile));
