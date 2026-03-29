import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { shippingRepository } from '../shipping.repository';
import {
  createTestApp,
  createAuthHeader,
  seedBuyer,
  seedSeller,
  seedStore,
  seedCategory,
  seedSize,
  seedProduct,
  seedProductStock,
  seedOrderWithShipping,
  cleanupDatabase,
} from './shipping.test-util';

const app = createTestApp();

let buyerId: string;

beforeEach(async () => {
  await cleanupDatabase();

  const buyer = await seedBuyer();
  const seller = await seedSeller();
  const store = await seedStore(seller.id);
  const category = await seedCategory();
  await seedSize();
  await seedProduct(store.id, category.id);
  await seedProductStock('test-product-id', 1, 100);

  buyerId = buyer.id;
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe('인증이 필요한 배송 API 통합 테스트', () => {
  // ─── GET /api/shipping/:orderId ───
  describe('GET /api/shipping/:orderId', () => {
    test('배송 정보를 정상적으로 조회한다', async () => {
      const order = await seedOrderWithShipping(buyerId);

      const res = await request(app)
        .get(`/api/shipping/${order.id}`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBe(order.id);
      expect(res.body.data.status).toBe('ReadyToShip');
      expect(res.body.data).toHaveProperty('trackingNumber');
      expect(res.body.data).toHaveProperty('carrier');
      expect(res.body.data).toHaveProperty('shippingHistories');
    });

    test('존재하지 않는 주문의 배송을 조회하면 404를 반환한다', async () => {
      const res = await request(app)
        .get('/api/shipping/non-existent-order')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/shipping/any-id');
      expect(res.status).toBe(401);
    });
  });

  // ─── POST /api/shipping/:orderId/auto-progress ───
  describe('POST /api/shipping/:orderId/auto-progress', () => {
    test('ReadyToShip → InShipping으로 진행한다', async () => {
      const order = await seedOrderWithShipping(buyerId, {
        shippingStatus: 'ReadyToShip',
      });

      const res = await request(app)
        .post(`/api/shipping/${order.id}/auto-progress`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('InShipping');
      expect(res.body.data.inShippingAt).not.toBeNull();
    });

    test('InShipping → Delivered로 진행한다', async () => {
      const order = await seedOrderWithShipping(buyerId, {
        shippingStatus: 'InShipping',
      });

      const res = await request(app)
        .post(`/api/shipping/${order.id}/auto-progress`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Delivered');
      expect(res.body.data.deliveredAt).not.toBeNull();
    });

    test('Delivered 상태에서는 변경 없이 현재 상태를 반환한다', async () => {
      const order = await seedOrderWithShipping(buyerId, {
        shippingStatus: 'Delivered',
      });

      const res = await request(app)
        .post(`/api/shipping/${order.id}/auto-progress`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Delivered');
    });

    test('존재하지 않는 주문이면 404를 반환한다', async () => {
      const res = await request(app)
        .post('/api/shipping/non-existent-order/auto-progress')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).post('/api/shipping/any-id/auto-progress');
      expect(res.status).toBe(401);
    });
  });

  // ─── PATCH /api/shipping/:orderId/status ───
  describe('PATCH /api/shipping/:orderId/status', () => {
    test('배송 상태를 InShipping으로 업데이트한다', async () => {
      const order = await seedOrderWithShipping(buyerId, {
        shippingStatus: 'ReadyToShip',
      });

      const res = await request(app)
        .patch(`/api/shipping/${order.id}/status`)
        .set(createAuthHeader(buyerId))
        .send({ status: 'InShipping' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('InShipping');
      expect(res.body.data.inShippingAt).not.toBeNull();
      expect(res.body.message).toBe('배송 상태가 업데이트되었습니다');
    });

    test('배송 상태를 Delivered로 업데이트한다', async () => {
      const order = await seedOrderWithShipping(buyerId, {
        shippingStatus: 'InShipping',
      });

      const res = await request(app)
        .patch(`/api/shipping/${order.id}/status`)
        .set(createAuthHeader(buyerId))
        .send({ status: 'Delivered' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Delivered');
      expect(res.body.data.deliveredAt).not.toBeNull();
    });

    test('배송 상태를 ReadyToShip으로 업데이트한다', async () => {
      const order = await seedOrderWithShipping(buyerId);

      const res = await request(app)
        .patch(`/api/shipping/${order.id}/status`)
        .set(createAuthHeader(buyerId))
        .send({ status: 'ReadyToShip' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ReadyToShip');
      expect(res.body.data.readyToShipAt).not.toBeNull();
    });

    test('status가 없으면 400을 반환한다', async () => {
      const order = await seedOrderWithShipping(buyerId);

      const res = await request(app)
        .patch(`/api/shipping/${order.id}/status`)
        .set(createAuthHeader(buyerId))
        .send({});

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app)
        .patch('/api/shipping/any-id/status')
        .send({ status: 'InShipping' });
      expect(res.status).toBe(401);
    });
  });

  // ─── Repository 직접 테스트 ───
  describe('ShippingRepository.addShippingHistory', () => {
    test('배송 이력을 정상적으로 추가한다', async () => {
      const order = await seedOrderWithShipping(buyerId);

      const history = await shippingRepository.addShippingHistory(
        order.shipping!.id,
        {
          status: 'InShipping',
          description: '배송이 시작되었습니다',
          location: '서울 물류센터',
        },
      );

      expect(history).toHaveProperty('id');
      expect(history.shippingId).toBe(order.shipping!.id);
      expect(history.status).toBe('InShipping');
      expect(history.description).toBe('배송이 시작되었습니다');
      expect(history.location).toBe('서울 물류센터');
    });

    test('location 없이 배송 이력을 추가할 수 있다', async () => {
      const order = await seedOrderWithShipping(buyerId);

      const history = await shippingRepository.addShippingHistory(
        order.shipping!.id,
        {
          status: 'Delivered',
          description: '배송이 완료되었습니다',
        },
      );

      expect(history.location).toBeNull();
      expect(history.description).toBe('배송이 완료되었습니다');
    });
  });
});
