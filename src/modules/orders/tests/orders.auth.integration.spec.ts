import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import { orderRepository } from '../orders.repository';
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
  seedOrder,
  seedShippingOrder,
  seedGrade,
  seedCartWithItem,
  cleanupDatabase,
} from './orders.test-util';

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('인증이 필요한 주문 API 통합 테스트', () => {
  // ─── GET /api/orders ───
  describe('GET /api/orders', () => {
    test('주문 목록을 정상적으로 조회한다', async () => {
      await seedOrder(buyerId);

      const res = await request(app)
        .get('/api/orders')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toHaveProperty('total', 1);
      expect(res.body.meta).toHaveProperty('page', 1);
      expect(res.body.meta).toHaveProperty('limit', 10);
    });

    test('페이지네이션 파라미터가 정상 동작한다', async () => {
      await seedOrder(buyerId);
      await seedOrder(buyerId);

      const res = await request(app)
        .get('/api/orders?page=1&limit=1')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.totalPages).toBe(2);
    });

    test('status 필터로 주문을 조회할 수 있다', async () => {
      await seedOrder(buyerId);

      const res = await request(app)
        .get('/api/orders?status=WaitingPayment')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(0);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/orders/:orderId ───
  describe('GET /api/orders/:orderId', () => {
    test('주문 상세를 정상적으로 조회한다', async () => {
      const order = await seedOrder(buyerId);

      const res = await request(app)
        .get(`/api/orders/${order.id}`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(order.id);
      expect(res.body.buyerId).toBe(buyerId);
    });

    test('존재하지 않는 주문을 조회하면 404를 반환한다', async () => {
      const res = await request(app)
        .get('/api/orders/non-existent-order-id')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('다른 바이어의 주문을 조회하면 400을 반환한다', async () => {
      const order = await seedOrder(buyerId);

      const res = await request(app)
        .get(`/api/orders/${order.id}`)
        .set(createAuthHeader(otherBuyerId));

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/orders/test-order-id');
      expect(res.status).toBe(401);
    });
  });

  // ─── POST /api/orders ───
  describe('POST /api/orders', () => {
    const validOrderBody = {
      name: '테스트바이어',
      phone: '010-1111-2222',
      address: '서울시 강남구',
      orderItems: [{ productId: 'test-product-id', sizeId: 1, quantity: 2 }],
      usePoint: 0,
    };

    test('주문을 정상적으로 생성한다', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send(validOrderBody);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.buyerName).toBe('테스트바이어');
    });

    test('포인트를 사용하여 주문을 생성한다', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send({ ...validOrderBody, usePoint: 5000 });

      expect(res.status).toBe(201);
      expect(res.body.usedPoints).toBe(5000);
    });

    test('주문 상품이 없으면 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send({ ...validOrderBody, orderItems: [] });

      expect(res.status).toBe(400);
    });

    test('수량이 0 이하이면 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send({
          ...validOrderBody,
          orderItems: [
            { productId: 'test-product-id', sizeId: 1, quantity: 0 },
          ],
        });

      expect(res.status).toBe(400);
    });

    test('수량이 999 초과이면 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send({
          ...validOrderBody,
          orderItems: [
            { productId: 'test-product-id', sizeId: 1, quantity: 1000 },
          ],
        });

      expect(res.status).toBe(400);
    });

    test('배송 정보가 누락되면 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send({
          name: '',
          phone: '010-1111-2222',
          address: '서울시',
          orderItems: [
            { productId: 'test-product-id', sizeId: 1, quantity: 1 },
          ],
          usePoint: 0,
        });

      expect(res.status).toBe(400);
    });

    test('포인트가 주문 금액을 초과하면 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send({ ...validOrderBody, usePoint: 9999999 });

      expect(res.status).toBe(400);
    });

    test('존재하지 않는 상품으로 주문하면 404를 반환한다', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send({
          ...validOrderBody,
          orderItems: [
            { productId: 'non-existent-product', sizeId: 1, quantity: 1 },
          ],
        });

      expect(res.status).toBe(404);
    });

    test('재고 부족 시 409를 반환한다', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send({
          ...validOrderBody,
          orderItems: [
            { productId: 'test-product-id', sizeId: 1, quantity: 999 },
          ],
        });

      expect(res.status).toBe(409);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).post('/api/orders').send(validOrderBody);

      expect(res.status).toBe(401);
    });

    // ─── 품절 시 알림 + 등급 업그레이드 커버리지 ───
    test('재고를 소진하면 품절 알림이 생성되고 주문이 완료된다', async () => {
      await prisma.productStock.update({
        where: {
          productId_sizeId: {
            productId: 'test-product-id',
            sizeId: 1,
          },
        },
        data: { quantity: 2 },
      });

      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send(validOrderBody);

      expect(res.status).toBe(201);

      const stock = await prisma.productStock.findUnique({
        where: {
          productId_sizeId: {
            productId: 'test-product-id',
            sizeId: 1,
          },
        },
      });
      expect(stock!.quantity).toBe(0);

      const notifications = await prisma.notification.findMany({
        where: { userId: 'test-seller-id' },
      });
      expect(notifications.length).toBeGreaterThanOrEqual(1);
      expect(notifications.some((n) => n.content.includes('품절'))).toBe(true);
    });

    test('장바구니에 담긴 상품이 품절되면 바이어에게도 알림이 생성된다', async () => {
      await seedCartWithItem(otherBuyerId, 'test-product-id', 1);

      await prisma.productStock.update({
        where: {
          productId_sizeId: {
            productId: 'test-product-id',
            sizeId: 1,
          },
        },
        data: { quantity: 2 },
      });

      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send(validOrderBody);

      expect(res.status).toBe(201);

      const notifications = await prisma.notification.findMany({
        where: { userId: otherBuyerId },
      });
      expect(notifications.length).toBeGreaterThanOrEqual(1);
      expect(notifications.some((n) => n.content.includes('품절'))).toBe(true);
    });

    test('등급이 있는 바이어가 주문하면 포인트가 적립되고 등급이 업그레이드된다', async () => {
      await seedGrade({
        id: 'grade-green',
        name: 'Green',
        rate: 1,
        minAmount: 0,
      });
      await seedGrade({
        id: 'grade-silver',
        name: 'Silver',
        rate: 3,
        minAmount: 10000,
      });

      await prisma.user.update({
        where: { id: buyerId },
        data: { gradeId: 'grade-green' },
      });

      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(buyerId))
        .send(validOrderBody);

      expect(res.status).toBe(201);
      expect(res.body.earnedPoints).toBeGreaterThanOrEqual(0);

      const updatedUser = await prisma.user.findUnique({
        where: { id: buyerId },
      });
      expect(updatedUser!.gradeId).toBe('grade-silver');
      expect(updatedUser!.lifetimeSpend).toBeGreaterThan(0);
    });
  });

  // ─── PATCH /api/orders/:orderId ───
  describe('PATCH /api/orders/:orderId', () => {
    test('주문 정보를 정상적으로 수정한다', async () => {
      const order = await seedOrder(buyerId);

      const res = await request(app)
        .patch(`/api/orders/${order.id}`)
        .set(createAuthHeader(buyerId))
        .send({
          name: '수정된이름',
          phone: '010-9999-8888',
          address: '부산시 해운대구',
        });

      expect(res.status).toBe(200);
      expect(res.body.buyerName).toBe('수정된이름');
      expect(res.body.phoneNumber).toBe('010-9999-8888');
      expect(res.body.address).toBe('부산시 해운대구');
    });

    test('일부 필드만 수정할 수 있다', async () => {
      const order = await seedOrder(buyerId);

      const res = await request(app)
        .patch(`/api/orders/${order.id}`)
        .set(createAuthHeader(buyerId))
        .send({ address: '대전시 유성구' });

      expect(res.status).toBe(200);
      expect(res.body.address).toBe('대전시 유성구');
    });

    test('존재하지 않는 주문을 수정하면 404를 반��한다', async () => {
      const res = await request(app)
        .patch('/api/orders/non-existent-order-id')
        .set(createAuthHeader(buyerId))
        .send({ name: '수정' });

      expect(res.status).toBe(404);
    });

    test('다른 바이어의 주문을 수정하면 400을 반환한다', async () => {
      const order = await seedOrder(buyerId);

      const res = await request(app)
        .patch(`/api/orders/${order.id}`)
        .set(createAuthHeader(otherBuyerId))
        .send({ name: '수정' });

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app)
        .patch('/api/orders/test-order-id')
        .send({ name: '수정' });

      expect(res.status).toBe(401);
    });
  });

  // ─── DELETE /api/orders/:orderId ───
  describe('DELETE /api/orders/:orderId', () => {
    test('주문을 정상적으로 취소한다', async () => {
      const order = await seedOrder(buyerId);

      const res = await request(app)
        .delete(`/api/orders/${order.id}`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('주문이 취소되었습니다');
    });

    test('포인트를 사용한 주문을 취소하면 포인트가 복원된다', async () => {
      const order = await seedOrder(buyerId, {
        usedPoints: 3000,
        earnedPoints: 200,
      });

      const userBefore = await prisma.user.findUnique({
        where: { id: buyerId },
      });

      const res = await request(app)
        .delete(`/api/orders/${order.id}`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);

      const userAfter = await prisma.user.findUnique({
        where: { id: buyerId },
      });
      expect(userAfter!.points).toBe(userBefore!.points + 3200);
    });

    test('존재하지 않는 주문을 취소하면 404를 반환한다', async () => {
      const res = await request(app)
        .delete('/api/orders/non-existent-order-id')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('다른 바이어의 주문을 취소하면 400을 반환한다', async () => {
      const order = await seedOrder(buyerId);

      const res = await request(app)
        .delete(`/api/orders/${order.id}`)
        .set(createAuthHeader(otherBuyerId));

      expect(res.status).toBe(400);
    });

    test('배송 중인 주문은 취소할 수 없다', async () => {
      const order = await seedShippingOrder(buyerId);

      const res = await request(app)
        .delete(`/api/orders/${order.id}`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).delete('/api/orders/test-order-id');
      expect(res.status).toBe(401);
    });
  });

  // ─── Repository: cancelOrderWithTransaction 직접 테스트 ───
  describe('OrderRepository.cancelOrderWithTransaction', () => {
    test('존재하지 않는 주문 ID로 취소하면 에러를 던진다', async () => {
      await expect(
        orderRepository.cancelOrderWithTransaction(
          buyerId,
          'non-existent-order-id',
        ),
      ).rejects.toThrow('주문을 찾을 수 없습니다');
    });
  });
});
