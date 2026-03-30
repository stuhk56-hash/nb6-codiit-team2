import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { getGrade } from './metadata.controller';

export const metadataRouter = Router();

/**
 * @swagger
 * /api/metadata/grade:
 *   get:
 *     tags: [Metadata]
 *     summary: 등급 값 조회
 *     description: 등급 값 가져오기
 *     responses:
 *       200:
 *         description: 등급 값
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GradeResponse'
 */
metadataRouter.get('/grade', withAsync(getGrade));
