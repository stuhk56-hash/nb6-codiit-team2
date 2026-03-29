import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
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
  seedCart,
  seedCartItem,
  cleanupDatabase,
} from './cart.test-util';

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

describe('인증이 필요한 장바구니 API 통합 테스트', () => {
  // ─── POST /api/cart ───
  describe('POST /api/cart', () => {
    test('장바구니를 정상적으로 생성한다', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.buyerId).toBe(buyerId);
    });

    test('이미 장바구니가 있으면 기존 장바구니를 반환한다', async () => {
      const cart = await seedCart(buyerId);

      const res = await request(app)
        .post('/api/cart')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(cart.id);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).post('/api/cart');
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/cart ───
  describe('GET /api/cart', () => {
    test('장바구니를 아이템과 함께 정상적으로 조회한다', async () => {
      const cart = await seedCart(buyerId);
      await seedCartItem(cart.id, 'test-product-id', 1, 3);

      const res = await request(app)
        .get('/api/cart')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.buyerId).toBe(buyerId);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(3);
      expect(res.body.items[0].product).toHaveProperty('name', '테스트상품');
      expect(res.body.items[0].product.store).toHaveProperty(
        'name',
        '테스트스토어',
      );
      expect(res.body.items[0].product.stocks).toHaveLength(1);
    });

    test('빈 장바구니를 조회하면 아이템이 비어있다', async () => {
      await seedCart(buyerId);

      const res = await request(app)
        .get('/api/cart')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });

    test('장바구니가 없으면 404를 반환한다', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
    });
  });

  // ─── PATCH /api/cart ───
  describe('PATCH /api/cart', () => {
    test('장바구니에 새 아이템을 추가한다', async () => {
      await seedCart(buyerId);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: 'test-product-id',
          sizes: [{ sizeId: 1, quantity: 5 }],
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].productId).toBe('test-product-id');
      expect(res.body[0].sizeId).toBe(1);
      expect(res.body[0].quantity).toBe(5);
    });

    test('기존 아이템의 수량을 업데이트한다', async () => {
      const cart = await seedCart(buyerId);
      await seedCartItem(cart.id, 'test-product-id', 1, 2);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: 'test-product-id',
          sizes: [{ sizeId: 1, quantity: 10 }],
        });

      expect(res.status).toBe(200);
      expect(res.body[0].quantity).toBe(10);
    });

    test('여러 사이즈를 한 번에 추가할 수 있다', async () => {
      await seedCart(buyerId);
      await seedSize({ id: 2, name: 'L', nameEn: 'Large', nameKo: '큰' });
      await seedProductStock('test-product-id', 2, 50);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: 'test-product-id',
          sizes: [
            { sizeId: 1, quantity: 3 },
            { sizeId: 2, quantity: 7 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    test('productId가 없으면 400을 반환한다', async () => {
      await seedCart(buyerId);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: '',
          sizes: [{ sizeId: 1, quantity: 1 }],
        });

      expect(res.status).toBe(400);
    });

    test('sizes가 빈 배열이면 400을 반환한다', async () => {
      await seedCart(buyerId);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: 'test-product-id',
          sizes: [],
        });

      expect(res.status).toBe(400);
    });

    test('존재하지 않는 상품이면 400을 반환한다', async () => {
      await seedCart(buyerId);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: 'non-existent-product',
          sizes: [{ sizeId: 1, quantity: 1 }],
        });

      expect(res.status).toBe(400);
    });

    test('수량이 0이면 400을 반환한다', async () => {
      await seedCart(buyerId);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: 'test-product-id',
          sizes: [{ sizeId: 1, quantity: 0 }],
        });

      expect(res.status).toBe(400);
    });

    test('수량이 999 초과이면 400을 반환한다', async () => {
      await seedCart(buyerId);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: 'test-product-id',
          sizes: [{ sizeId: 1, quantity: 1000 }],
        });

      expect(res.status).toBe(400);
    });

    test('수량이 소수이면 400을 반환한다', async () => {
      await seedCart(buyerId);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: 'test-product-id',
          sizes: [{ sizeId: 1, quantity: 1.5 }],
        });

      expect(res.status).toBe(400);
    });

    test('장바구니가 없으면 404를 반환한다', async () => {
      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({
          productId: 'test-product-id',
          sizes: [{ sizeId: 1, quantity: 1 }],
        });

      expect(res.status).toBe(404);
    });

    test('잘못된 body 구조이면 400을 반환한다 (superstruct)', async () => {
      await seedCart(buyerId);

      const res = await request(app)
        .patch('/api/cart')
        .set(createAuthHeader(buyerId))
        .send({ wrong: 'data' });

      expect(res.status).toBe(400);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app)
        .patch('/api/cart')
        .send({ productId: 'test', sizes: [{ sizeId: 1, quantity: 1 }] });

      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/cart/:cartItemId ───
  describe('GET /api/cart/:cartItemId', () => {
    test('장바구니 아이템 상세를 정상적으로 조회한다', async () => {
      const cart = await seedCart(buyerId);
      const cartItem = await seedCartItem(cart.id, 'test-product-id', 1, 3);

      const res = await request(app)
        .get(`/api/cart/${cartItem.id}`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(cartItem.id);
      expect(res.body.quantity).toBe(3);
      expect(res.body.product).toHaveProperty('name', '테스트상품');
      expect(res.body.cart.buyerId).toBe(buyerId);
    });

    test('존재하지 않는 아이템을 조회하면 404를 반환한다', async () => {
      const res = await request(app)
        .get('/api/cart/non-existent-item-id')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('다른 바이어의 장바구니 아이템을 조회하면 404를 반환한다', async () => {
      const cart = await seedCart(buyerId);
      const cartItem = await seedCartItem(cart.id, 'test-product-id', 1, 2);

      const res = await request(app)
        .get(`/api/cart/${cartItem.id}`)
        .set(createAuthHeader(otherBuyerId));

      expect(res.status).toBe(404);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).get('/api/cart/any-id');
      expect(res.status).toBe(401);
    });
  });

  // ─── DELETE /api/cart/:cartItemId ───
  describe('DELETE /api/cart/:cartItemId', () => {
    test('장바구니 아이템을 정상적으로 삭제한다', async () => {
      const cart = await seedCart(buyerId);
      const cartItem = await seedCartItem(cart.id, 'test-product-id', 1, 2);

      const res = await request(app)
        .delete(`/api/cart/${cartItem.id}`)
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(204);

      const deleted = await prisma.cartItem.findUnique({
        where: { id: cartItem.id },
      });
      expect(deleted).toBeNull();
    });

    test('존재하지 않는 아이템을 삭제하면 404를 반환한다', async () => {
      const res = await request(app)
        .delete('/api/cart/non-existent-item-id')
        .set(createAuthHeader(buyerId));

      expect(res.status).toBe(404);
    });

    test('다른 바이어의 장바구니 아이템을 삭제하면 404를 반환한다', async () => {
      const cart = await seedCart(buyerId);
      const cartItem = await seedCartItem(cart.id, 'test-product-id', 1, 2);

      const res = await request(app)
        .delete(`/api/cart/${cartItem.id}`)
        .set(createAuthHeader(otherBuyerId));

      expect(res.status).toBe(404);
    });

    test('토큰 없이 요청하면 401을 반환한다', async () => {
      const res = await request(app).delete('/api/cart/any-id');
      expect(res.status).toBe(401);
    });
  });
});
