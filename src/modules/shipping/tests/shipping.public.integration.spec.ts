import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { createTestApp, cleanupDatabase } from './shipping.test-util';

const app = createTestApp();

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe('비인증 배송 API 통합 테스트', () => {
  describe('모든 배송 엔드포인트는 인증이 필요하다', () => {
    test('GET /api/shipping/:orderId — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/shipping/any-id');
      expect(res.status).toBe(401);
    });

    test('POST /api/shipping/:orderId/auto-progress — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).post('/api/shipping/any-id/auto-progress');
      expect(res.status).toBe(401);
    });

    test('PATCH /api/shipping/:orderId/status — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app)
        .patch('/api/shipping/any-id/status')
        .send({ status: 'InShipping' });
      expect(res.status).toBe(401);
    });
  });
});
