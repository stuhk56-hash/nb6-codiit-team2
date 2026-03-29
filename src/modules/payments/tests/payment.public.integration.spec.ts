import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { createTestApp, cleanupDatabase } from './payment.test-util';

const app = createTestApp();

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe('비인증 결제 API 통합 테스트', () => {
  describe('모든 결제 엔드포인트는 인증이 필요하다', () => {
    test('POST /api/payments — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).post('/api/payments').send({});
      expect(res.status).toBe(401);
    });

    test('GET /api/payments/order/:orderId — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/payments/order/any-id');
      expect(res.status).toBe(401);
    });

    test('GET /api/payments/user/history — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/payments/user/history');
      expect(res.status).toBe(401);
    });

    test('GET /api/payments/:paymentId — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/payments/any-id');
      expect(res.status).toBe(401);
    });

    test('GET /api/payments — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/payments?status=WaitingPayment');
      expect(res.status).toBe(401);
    });

    test('PATCH /api/payments/:orderId/cancel — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).patch('/api/payments/any-id/cancel');
      expect(res.status).toBe(401);
    });
  });
});
