import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { createTestApp, cleanupDatabase } from './cart.test-util';

const app = createTestApp();

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe('비인증 장바구니 API 통합 테스트', () => {
  describe('모든 장바구니 엔드포인트는 인증이 필요하다', () => {
    test('POST /api/cart — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).post('/api/cart');
      expect(res.status).toBe(401);
    });

    test('GET /api/cart — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
    });

    test('PATCH /api/cart — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app)
        .patch('/api/cart')
        .send({ productId: 'test', sizes: [{ sizeId: 1, quantity: 1 }] });
      expect(res.status).toBe(401);
    });

    test('GET /api/cart/:cartItemId — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/cart/any-id');
      expect(res.status).toBe(401);
    });

    test('DELETE /api/cart/:cartItemId — 토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).delete('/api/cart/any-id');
      expect(res.status).toBe(401);
    });
  });
});
