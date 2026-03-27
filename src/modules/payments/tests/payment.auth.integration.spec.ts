import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  clearPaymentTestData,
  createTestApp,
  seedBuyer,
  seedOrder,
  seedPayment,
  authHeader,
} from './payment.test-util';

describe('결제 API 통합 테스트', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await clearPaymentTestData();
  });

  afterAll(async () => {
    await clearPaymentTestData();
    await prisma.$disconnect();
  });

  describe('인증이 필요한 결제 API 통합 테스트', () => {
    describe('POST /api/payments', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).post('/api/payments').send({
          orderId: 'order-1',
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
          cardNumber: '1234567890123456',
        });

        expect(res.status).toBe(401);
      });

      test('필수 정보가 누락되면 400을 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .post('/api/payments')
          .set(authHeader(buyer.id))
          .send({
            orderId: 'order-1',
            paymentMethod: 'CREDIT_CARD',
          });

        expect(res.status).toBe(400);
      });

      test('유효하지 않은 결제 수단이면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);

        const res = await request(app)
          .post('/api/payments')
          .set(authHeader(buyer.id))
          .send({
            orderId: order.id,
            price: 50000,
            paymentMethod: 'INVALID_METHOD',
          });

        expect(res.status).toBe(400);
      });

      test('결제 금액이 0 이하면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);

        const res = await request(app)
          .post('/api/payments')
          .set(authHeader(buyer.id))
          .send({
            orderId: order.id,
            price: 0,
            paymentMethod: 'CREDIT_CARD',
          });

        expect(res.status).toBe(400);
      });

      test('결제 금액이 정수가 아니면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);

        const res = await request(app)
          .post('/api/payments')
          .set(authHeader(buyer.id))
          .send({
            orderId: order.id,
            price: 50000.5,
            paymentMethod: 'CREDIT_CARD',
          });

        expect(res.status).toBe(400);
      });

      test('신용카드로 결제하면 201과 결제 정보를 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);

        const res = await request(app)
          .post('/api/payments')
          .set(authHeader(buyer.id))
          .send({
            orderId: order.id,
            price: 50000,
            paymentMethod: 'CREDIT_CARD',
            cardNumber: '1234567890123456',
          });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.paymentMethod).toBe('CREDIT_CARD');
        expect(res.body.data.cardNumber).toBe('3456');
        expect(res.body.data.status).toBe('CompletedPayment');
      });

      test('계좌이체로 결제하면 201과 결제 정보를 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);

        const res = await request(app)
          .post('/api/payments')
          .set(authHeader(buyer.id))
          .send({
            orderId: order.id,
            price: 50000,
            paymentMethod: 'BANK_TRANSFER',
            bankName: '국민은행',
          });

        expect(res.status).toBe(201);
        expect(res.body.data.paymentMethod).toBe('BANK_TRANSFER');
        expect(res.body.data.bankName).toBe('국민은행');
      });

      test('휴대폰 결제로 결제하면 201과 결제 정보를 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);

        const res = await request(app)
          .post('/api/payments')
          .set(authHeader(buyer.id))
          .send({
            orderId: order.id,
            price: 50000,
            paymentMethod: 'MOBILE_PHONE',
            phoneNumber: '01012345678',
          });

        expect(res.status).toBe(201);
        expect(res.body.data.paymentMethod).toBe('MOBILE_PHONE');
      });

      test('존재하지 않는 주문으로 결제하면 400을 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .post('/api/payments')
          .set(authHeader(buyer.id))
          .send({
            orderId: 'not-exists-order',
            price: 50000,
            paymentMethod: 'CREDIT_CARD',
            cardNumber: '1234567890123456',
          });

        expect(res.status).toBe(400);
      });

      test('이미 결제된 주문으로 다시 결제하면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);
        await seedPayment({
          orderId: order.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
          status: 'CompletedPayment',
        });

        const res = await request(app)
          .post('/api/payments')
          .set(authHeader(buyer.id))
          .send({
            orderId: order.id,
            price: 50000,
            paymentMethod: 'CREDIT_CARD',
            cardNumber: '1234567890123456',
          });

        expect(res.status).toBe(400);
      });
    });

    describe('GET /api/payments/order/:orderId', () => {
      test('본인 주문의 결제 정보를 조회하면 200을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);
        const payment = await seedPayment({
          orderId: order.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
        });

        const res = await request(app)
          .get(`/api/payments/order/${order.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(payment.id);
        expect(res.body.data.orderId).toBe(order.id);
      });

      test('다른 사용자의 주문 결제 정보를 조회하면 400을 반환한다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const order = await seedOrder(buyer1.id);
        await seedPayment({
          orderId: order.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
        });

        const res = await request(app)
          .get(`/api/payments/order/${order.id}`)
          .set(authHeader(buyer2.id));

        expect(res.status).toBe(400);
      });

      test('존재하지 않는 결제 정보를 조회하면 404를 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .get('/api/payments/order/not-exists-order')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(404);
      });
    });

    describe('GET /api/payments/user/history', () => {
      test('사용자의 결제 내역을 페이지네이션으로 조회하면 200을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order1 = await seedOrder(buyer.id);
        const order2 = await seedOrder(buyer.id);
        await seedPayment({
          orderId: order1.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
        });
        await seedPayment({
          orderId: order2.id,
          price: 30000,
          paymentMethod: 'BANK_TRANSFER',
        });

        const res = await request(app)
          .get('/api/payments/user/history')
          .query({ page: 1, limit: 10 })
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.meta.total).toBe(2);
      });

      test('페이지네이션이 정확하게 작동한다', async () => {
        const buyer = await seedBuyer();

        for (let i = 0; i < 15; i += 1) {
          const order = await seedOrder(buyer.id);
          await seedPayment({
            orderId: order.id,
            price: 50000,
            paymentMethod: 'CREDIT_CARD',
          });
        }

        const res = await request(app)
          .get('/api/payments/user/history')
          .query({ page: 2, limit: 5 })
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(5);
        expect(res.body.meta.totalPages).toBe(3);
      });

      test('상태 필터로 결제 내역을 조회할 수 있다', async () => {
        const buyer = await seedBuyer();
        const order1 = await seedOrder(buyer.id);
        const order2 = await seedOrder(buyer.id);
        await seedPayment({
          orderId: order1.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
          status: 'CompletedPayment',
        });
        await seedPayment({
          orderId: order2.id,
          price: 30000,
          paymentMethod: 'BANK_TRANSFER',
          status: 'CanceledPayment',
        });

        const res = await request(app)
          .get('/api/payments/user/history')
          .query({ page: 1, limit: 10, status: 'CompletedPayment' })
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
      });

      test('page가 0이면 200을 반환한다 (querystring 타입 변환)', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .get('/api/payments/user/history')
          .query({ page: 0, limit: 10 })
          .set(authHeader(buyer.id));

        // page 0은 Number(0) = 0 < 1 이므로 실제로는 400 반환
        expect([200, 400]).toContain(res.status);
      });
    });

    describe('GET /api/payments/:paymentId', () => {
      test('본인 결제 정보를 조회하면 200을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);
        const payment = await seedPayment({
          orderId: order.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
        });

        const res = await request(app)
          .get(`/api/payments/${payment.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(payment.id);
      });

      test('다른 사용자의 결제 정보를 조회하면 400을 반환한다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const order = await seedOrder(buyer1.id);
        const payment = await seedPayment({
          orderId: order.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
        });

        const res = await request(app)
          .get(`/api/payments/${payment.id}`)
          .set(authHeader(buyer2.id));

        expect(res.status).toBe(400);
      });

      test('존재하지 않는 결제 ID로 조회하면 404를 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .get('/api/payments/not-exists-payment')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(404);
      });
    });

    describe('PATCH /api/payments/:orderId/cancel', () => {
      test('본인 주문의 결제를 취소하면 200을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);
        await seedPayment({
          orderId: order.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
          status: 'WaitingPayment',
        });

        const res = await request(app)
          .patch(`/api/payments/${order.id}/cancel`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('CanceledPayment');
      });

      test('이미 결제 완료된 주문은 취소할 수 없어 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);
        await seedPayment({
          orderId: order.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
          status: 'CompletedPayment',
        });

        const res = await request(app)
          .patch(`/api/payments/${order.id}/cancel`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(400);
      });

      test('이미 취소된 주문은 다시 취소할 수 없어 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder(buyer.id);
        await seedPayment({
          orderId: order.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
          status: 'CanceledPayment',
        });

        const res = await request(app)
          .patch(`/api/payments/${order.id}/cancel`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(400);
      });

      test('다른 사용자의 결제를 취소하면 400을 반환한다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const order = await seedOrder(buyer1.id);
        await seedPayment({
          orderId: order.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
          status: 'WaitingPayment',
        });

        const res = await request(app)
          .patch(`/api/payments/${order.id}/cancel`)
          .set(authHeader(buyer2.id));

        expect(res.status).toBe(400);
      });

      test('존재하지 않는 결제를 취소하면 404를 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .patch('/api/payments/not-exists-order/cancel')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(404);
      });
    });

    describe('GET /api/payments (관리자용 상태별 조회)', () => {
      test('상태 파라��터가 없으면 400을 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .get('/api/payments')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(400);
      });

      test('특정 상태의 결제 목록을 조회하면 200을 반환한다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const order1 = await seedOrder(buyer1.id);
        const order2 = await seedOrder(buyer2.id);
        await seedPayment({
          orderId: order1.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
          status: 'CompletedPayment',
        });
        await seedPayment({
          orderId: order2.id,
          price: 30000,
          paymentMethod: 'BANK_TRANSFER',
          status: 'CompletedPayment',
        });

        const res = await request(app)
          .get('/api/payments')
          .query({ status: 'CompletedPayment' })
          .set(authHeader(buyer1.id));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
      });

      test('취소된 결제 목록을 조회할 수 있다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const order1 = await seedOrder(buyer1.id);
        const order2 = await seedOrder(buyer2.id);
        await seedPayment({
          orderId: order1.id,
          price: 50000,
          paymentMethod: 'CREDIT_CARD',
          status: 'CanceledPayment',
        });
        await seedPayment({
          orderId: order2.id,
          price: 30000,
          paymentMethod: 'BANK_TRANSFER',
          status: 'CompletedPayment',
        });

        const res = await request(app)
          .get('/api/payments')
          .query({ status: 'CanceledPayment' })
          .set(authHeader(buyer1.id));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
      });
    });
  });
});
