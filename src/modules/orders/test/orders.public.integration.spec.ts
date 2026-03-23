import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { clearOrdersTestData, createTestApp } from './orders.test-util';

describe('주문 API 공개 통합 테스트', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await clearOrdersTestData();
  });

  afterAll(async () => {
    await clearOrdersTestData();
    await prisma.$disconnect();
  });

  describe('인증이 필요한 주문 API 공개 통합 테스트', () => {
    describe('POST /api/orders', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .post('/api/orders')
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 1 }],
            usePoint: 0,
          });

        expect(res.status).toBe(401);
      });

      test('잘못된 토큰 형식이면 401을 반환한다', async () => {
        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', 'InvalidFormat')
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 1 }],
            usePoint: 0,
          });

        expect(res.status).toBe(401);
      });

      test('Bearer 토큰 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', 'Bearer')
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 1 }],
            usePoint: 0,
          });

        expect(res.status).toBe(401);
      });
    });

    describe('GET /api/orders', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).get('/api/orders');

        expect(res.status).toBe(401);
      });

      test('잘못된 토큰으로 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .get('/api/orders')
          .set('Authorization', 'Bearer invalid-token');

        expect(res.status).toBe(401);
      });

      test('유효하지 않은 형식의 토큰으로 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .get('/api/orders')
          .set('Authorization', 'invalid-format-token');

        expect(res.status).toBe(401);
      });
    });

    describe('GET /api/orders/:orderId', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).get('/api/orders/order-123');

        expect(res.status).toBe(401);
      });

      test('잘못된 토큰으로 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .get('/api/orders/order-123')
          .set('Authorization', 'Bearer invalid-token');

        expect(res.status).toBe(401);
      });

      test('유효하지 않은 형식의 토큰으로 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .get('/api/orders/order-123')
          .set('Authorization', 'invalid-format-token');

        expect(res.status).toBe(401);
      });
    });

    describe('PATCH /api/orders/:orderId', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).patch('/api/orders/order-123').send({
          name: '신길동',
          phone: '010-9999-9999',
          address: '인천시 남동구',
        });

        expect(res.status).toBe(401);
      });

      test('잘못된 토큰으로 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .patch('/api/orders/order-123')
          .set('Authorization', 'Bearer invalid-token')
          .send({
            name: '신길동',
            phone: '010-9999-9999',
            address: '인천시 남동구',
          });

        expect(res.status).toBe(401);
      });

      test('유효하지 않은 형식의 토큰으로 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .patch('/api/orders/order-123')
          .set('Authorization', 'invalid-format-token')
          .send({
            name: '신길동',
            phone: '010-9999-9999',
            address: '인천시 남동구',
          });

        expect(res.status).toBe(401);
      });
    });

    describe('DELETE /api/orders/:orderId', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).delete('/api/orders/order-123');

        expect(res.status).toBe(401);
      });

      test('잘못된 토큰으로 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .delete('/api/orders/order-123')
          .set('Authorization', 'Bearer invalid-token');

        expect(res.status).toBe(401);
      });

      test('유효하지 않은 형식의 토큰으로 요청하면 401을 반환한다', async () => {
        const res = await request(app)
          .delete('/api/orders/order-123')
          .set('Authorization', 'invalid-format-token');

        expect(res.status).toBe(401);
      });
    });
  });
});
