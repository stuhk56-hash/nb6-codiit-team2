import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { paymentRepository } from '../payment.repository';
import {
  createTestApp,
  createAuthHeader,
  seedBuyer,
  seedOtherBuyer,
  seedSeller,
  seedStore,
  seedCategory,
  seedSize,
  seedProduct,
  seedProductStock,
  seedOrderWithoutPayment,
  seedOrderWithPayment,
  cleanupDatabase,
} from './payment.test-util';

const app = createTestApp();

let buyerId: string;
let otherBuyerId: string;

beforeEach(async () => {
  await cleanupDatabase();

  const buyer = await seedBuyer();
  const otherBuyer = await seedOtherBuyer();
  const seller = await seedSeller();
  const store = await seedStore(seller.id);
  const category = await seedCategory();
  await seedSize();
  await seedProduct(store.id, category.id);
  await seedProductStock('test-product-id', 1, 100);

  buyerId = buyer.id;
  otherBuyerId = otherBuyer.id;
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe('인증이 필요한 결제 API 통합 테스트', () => {
  // ─── POST /api/payments ───
  describe('POST /api/payments', () => {
    test('신용카드로 결제를 정상적으로 생성한다', async () => {
      const order = await seedOrderWithoutPayment(buyerId);

      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({
          orderId: order.id,
          price: 20000,
          paymentMethod: 'CREDIT_CARD',
          cardNumber: '1234-5678-9012-3456',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.paymentMethod).toBe('CREDIT_CARD');
    });

    test('계좌이체로 결제를 생성한다', async () => {
      const order = await seedOrderWithoutPayment(buyerId);

      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({
          orderId: order.id,
          price: 20000,
          paymentMethod: 'BANK_TRANSFER',
          bankName: '국민은행',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.paymentMethod).toBe('BANK_TRANSFER');
    });

    test('휴대폰 결제를 생성한다', async () => {
      const order = await seedOrderWithoutPayment(buyerId);

      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({
          orderId: order.id,
          price: 20000,
          paymentMethod: 'MOBILE_PHONE',
          phoneNumber: '010-9999-8888',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.paymentMethod).toBe('MOBILE_PHONE');
    });

    test('이미 WaitingPayment 결제가 있는 주문에 결제하면 업데이트���다', async () => {
      const order = await seedOrderWithPayment(buyerId, {
        paymentStatus: 'WaitingPayment',
      });

      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({
          orderId: order.id,
          price: 20000,
          paymentMethod: 'CREDIT_CARD',
          cardNumber: '1111-2222-3333-4444',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('CompletedPayment');
    });

    test('이미 완료된 결제가 있는 주문에 다시 결제하면 400을 반환한다', async () => {
      const order = await seedOrderWithPayment(buyerId, {
        paymentStatus: 'CompletedPayment',
      });

      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({
          orderId: order.id,
          price: 20000,
          paymentMethod: 'CREDIT_CARD',
          cardNumber: '1111-2222-3333-4444',
        });

      expect(res.status).toBe(400);
    });

    test('필수 정보가 누락되면 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({ orderId: 'some-order' });

      expect(res.status).toBe(400);
    });

    test('유효하지 않은 결제 수단이면 400을 반환한다', async () => {
      const order = await seedOrderWithoutPayment(buyerId);

      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({
          orderId: order.id,
          price: 20000,
          paymentMethod: 'BITCOIN',
        });

      expect(res.status).toBe(400);
    });

    test('결제 금액이 0 이하이면 400을 반환한다', async () => {
      const order = await seedOrderWithoutPayment(buyerId);

      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({
          orderId: order.id,
          price: 0,
          paymentMethod: 'CREDIT_CARD',
        });

      expect(res.status).toBe(400);
    });

    test('결제 금액이 소수이면 400을 반환한다', async () => {
      const order = await seedOrderWithoutPayment(buyerId);

      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({
          orderId: order.id,
          price: 100.5,
          paymentMethod: 'CREDIT_CARD',
        });

      expect(res.status).toBe(400);
    });

    test('존재하지 않는 주문에 결제하면 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set(createAuthHeader(buyerId))
        .send({
          orderId: 'non-existent-order',
          price: 20000,
          paymentMethod: 'CREDIT_CARD',
        });

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app)
        .post('/api/payments')
        .send({ orderId: 'any', price: 1000, paymentMethod: 'CREDIT_CARD' });

      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/payments/order/:orderId ───
  describe('GET /api/payments/order/:orderId', () => {
    test('주문 ID로 결제를 정상적으로 조회한다', async () => {
      const order = await seedOrderWithPayment(buyerId);

      const res = await request(app)
        .get(`/api/payments/order/${order.id}`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBe(order.id);
    });

    test('존재하지 않는 주문의 결제를 조회하면 404를 반환한다', async () => {
      const res = await request(app)
        .get('/api/payments/order/non-existent-order')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('다른 바이어의 결제를 조회하면 400을 반환한다', async () => {
      const order = await seedOrderWithPayment(buyerId);

      const res = await request(app)
        .get(`/api/payments/order/${order.id}`)
        .set(createAuthHeader(otherBuyerId));

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/payments/order/any-id');
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/payments/user/history ───
  describe('GET /api/payments/user/history', () => {
    test('사용자 결제 내역을 정상적으로 조회한다', async () => {
      await seedOrderWithPayment(buyerId);

      const res = await request(app)
        .get('/api/payments/user/history')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toHaveProperty('total', 1);
    });

    test('페이지네이션이 정상 동작한다', async () => {
      await seedOrderWithPayment(buyerId);
      await seedOrderWithPayment(buyerId);

      const res = await request(app)
        .get('/api/payments/user/history?page=1&limit=1')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.totalPages).toBe(2);
    });

    test('status 필터로 조회할 수 있다', async () => {
      await seedOrderWithPayment(buyerId, { paymentStatus: 'WaitingPayment' });
      await seedOrderWithPayment(buyerId, {
        paymentStatus: 'CompletedPayment',
      });

      const res = await request(app)
        .get('/api/payments/user/history?status=WaitingPayment')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(
        res.body.data.every((p: any) => p.status === 'WaitingPayment'),
      ).toBe(true);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/payments/user/history');
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/payments/:paymentId ───
  describe('GET /api/payments/:paymentId', () => {
    test('결제 ID로 정상적으로 조회한다', async () => {
      const order = await seedOrderWithPayment(buyerId);

      const res = await request(app)
        .get(`/api/payments/${order.payment!.id}`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(order.payment!.id);
    });

    test('존재하지 않는 결제 ID를 조회하면 404를 반환한다', async () => {
      const res = await request(app)
        .get('/api/payments/non-existent-payment-id')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('다른 바이어의 결제를 조회하면 400을 반환한다', async () => {
      const order = await seedOrderWithPayment(buyerId);

      const res = await request(app)
        .get(`/api/payments/${order.payment!.id}`)
        .set(createAuthHeader(otherBuyerId));

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/payments/any-id');
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/payments (상태별 조회) ───
  describe('GET /api/payments', () => {
    test('상태별로 결제를 조회한다', async () => {
      await seedOrderWithPayment(buyerId, { paymentStatus: 'WaitingPayment' });

      const res = await request(app)
        .get('/api/payments?status=WaitingPayment')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    test('status 파라미터가 없으면 400을 반환한다', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/payments?status=WaitingPayment');
      expect(res.status).toBe(401);
    });
  });

  // ─── PATCH /api/payments/:orderId/cancel ───
  describe('PATCH /api/payments/:orderId/cancel', () => {
    test('대기 중인 결제를 정상적으로 취소한다', async () => {
      const order = await seedOrderWithPayment(buyerId, {
        paymentStatus: 'WaitingPayment',
      });

      const res = await request(app)
        .patch(`/api/payments/${order.id}/cancel`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CanceledPayment');
    });

    test('이미 완료된 결제는 취소할 수 없다', async () => {
      const order = await seedOrderWithPayment(buyerId, {
        paymentStatus: 'CompletedPayment',
      });

      const res = await request(app)
        .patch(`/api/payments/${order.id}/cancel`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(400);
    });

    test('존재하지 않는 주문의 결제를 취소하면 404를 반환한다', async () => {
      const res = await request(app)
        .patch('/api/payments/non-existent-order/cancel')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('다른 바이어의 결제를 취소하면 400을 반환한다', async () => {
      const order = await seedOrderWithPayment(buyerId, {
        paymentStatus: 'WaitingPayment',
      });

      const res = await request(app)
        .patch(`/api/payments/${order.id}/cancel`)
        .set(createAuthHeader(otherBuyerId));

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).patch('/api/payments/any-id/cancel');
      expect(res.status).toBe(401);
    });
  });

  // ─── Repository 직접 테스트 (커버리지) ───
  describe('PaymentRepository.cancelPaymentWithTransaction', () => {
    test('존재하지 않는 주문의 결제를 취소하면 에러를 던진다', async () => {
      await expect(
        paymentRepository.cancelPaymentWithTransaction('non-existent-order'),
      ).rejects.toThrow('결제 정보를 찾을 수 없습니다');
    });

    test('이미 완료된 결제를 취소하면 에러를 던진다', async () => {
      const order = await seedOrderWithPayment(buyerId, {
        paymentStatus: 'CompletedPayment',
      });

      await expect(
        paymentRepository.cancelPaymentWithTransaction(order.id),
      ).rejects.toThrow('이미 결제된 주문은 취소할 수 없습니다');
    });

    test('이미 취소된 결제를 다시 취소하면 에러를 던진다', async () => {
      const order = await seedOrderWithPayment(buyerId, {
        paymentStatus: 'CanceledPayment',
      });

      await expect(
        paymentRepository.cancelPaymentWithTransaction(order.id),
      ).rejects.toThrow('이미 취소된 결제입니다');
    });
  });

  describe('PaymentRepository.updatePaymentStatus', () => {
    test('결제 상태를 정상적으로 업데이트한다', async () => {
      const order = await seedOrderWithPayment(buyerId, {
        paymentStatus: 'WaitingPayment',
      });

      const result = await paymentRepository.updatePaymentStatus(
        order.payment!.id,
        'CompletedPayment' as any,
      );

      expect(result.id).toBe(order.payment!.id);
      expect(result.status).toBe('CompletedPayment');
    });

    test('FailedPayment 상태로 업데이트할 수 있다', async () => {
      const order = await seedOrderWithPayment(buyerId, {
        paymentStatus: 'WaitingPayment',
      });

      const result = await paymentRepository.updatePaymentStatus(
        order.payment!.id,
        'FailedPayment' as any,
      );

      expect(result.status).toBe('FailedPayment');
    });
  });
});
