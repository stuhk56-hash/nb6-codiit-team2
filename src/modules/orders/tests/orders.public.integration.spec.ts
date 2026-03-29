import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { createTestApp, cleanupDatabase } from './orders.test-util';

const app = createTestApp();

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('비인증 주문 API 통합 테스트', () => {
  describe('모든 주문 엔드포인트는 인증이 필요하다', () => {
    test('GET /api/orders — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    test('GET /api/orders/:orderId — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/orders/any-id');
      expect(res.status).toBe(401);
    });

    test('POST /api/orders — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).post('/api/orders').send({});
      expect(res.status).toBe(401);
    });

    test('PATCH /api/orders/:orderId — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).patch('/api/orders/any-id').send({});
      expect(res.status).toBe(401);
    });

    test('DELETE /api/orders/:orderId — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).delete('/api/orders/any-id');
      expect(res.status).toBe(401);
    });
  });
});
