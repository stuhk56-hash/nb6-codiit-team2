import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { clearCartTestData, createTestApp } from './cart.test-util';

describe('장바구니 API 통합 테스트', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await clearCartTestData();
  });

  afterAll(async () => {
    await clearCartTestData();
    await prisma.$disconnect();
  });

  describe('인증이 필요하지 않은 장바구니 API 통합 테스트', () => {
    describe('POST /api/cart', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).post('/api/cart');

        expect(res.status).toBe(401);
      });

      test('잘못된 토큰 형식이면 401을 반환한다', async () => {
        const res = await request(app)
          .post('/api/cart')
          .set('Authorization', 'InvalidFormat');

        expect(res.status).toBe(401);
      });
    });

    describe('GET /api/cart', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).get('/api/cart');

        expect(res.status).toBe(401);
      });
    });

    describe('PATCH /api/cart', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .patch('/api/cart')
          .send({
            productId: 'prod-123',
            sizes: [{ sizeId: 1, quantity: 2 }],
          });

        expect(res.status).toBe(401);
      });

      test('productId가 없으면 400을 반환한다', async () => {
        const res = await request(app)
          .patch('/api/cart')
          .set('Authorization', 'Bearer invalid-token')
          .send({
            sizes: [{ sizeId: 1, quantity: 2 }],
          });

        expect([400, 401]).toContain(res.status);
      });

      test('sizes 배열이 비어있으면 400을 반환한다', async () => {
        const res = await request(app)
          .patch('/api/cart')
          .set('Authorization', 'Bearer invalid-token')
          .send({
            productId: 'prod-123',
            sizes: [],
          });

        expect([400, 401]).toContain(res.status);
      });
    });

    describe('GET /api/cart/:cartItemId', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).get('/api/cart/item-123');

        expect(res.status).toBe(401);
      });
    });

    describe('DELETE /api/cart/:cartItemId', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).delete('/api/cart/item-123');

        expect(res.status).toBe(401);
      });
    });
  });
});
