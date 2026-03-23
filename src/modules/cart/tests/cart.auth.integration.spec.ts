import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  authHeader,
  clearCartTestData,
  createTestApp,
  seedBuyer,
  seedCategory,
  seedProduct,
  seedSellerAndStore,
  seedSize,
  seedCart,
  seedSeller,
} from './cart.test-util';

describe('장바구니 API 통합 테스트', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await clearCartTestData();
  });

  afterAll(async () => {
    await clearCartTestData();
    await prisma.$disconnect();
  });

  describe('인증이 필요한 장바구니 API 통합 테스트', () => {
    describe('Post /api/cart', () => {
      test('구매자 토큰으로 요청함녀 201과 장바구니 정보를 리턴', async () => {
        const buyer = await seedBuyer();
        const res = await request(app)
          .post('/api/cart')
          .set(authHeader(buyer.id));
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('buyerId', buyer.id);
        expect(res.body).toHaveProperty('createdAt');
        expect(res.body).toHaveProperty('updatedAt');
      });

      test('이미 존재하는 장바구니면 기존 장바구니를 리턴', async () => {
        const buyer = await seedBuyer();
        const res1 = await request(app)
          .post('/api/cart')
          .set(authHeader(buyer.id));

        const cartId1 = res1.body.id;

        const res2 = await request(app)
          .post('/api/cart')
          .set(authHeader(buyer.id));

        expect(res2.status).toBe(201);
        expect(res2.body.id).toBe(cartId1);
      });

      test('판매자 토큰으로 요청하면 403을 반환한다', async () => {
        const seller = await seedSeller();

        const res = await request(app)
          .post('/api/cart')
          .set(authHeader(seller.id));

        expect(res.status).toBe(403);
      });
    });

    describe('GET /api/cart', () => {
      test('구매자가 자신의 장바구니를 조회하면 200과 장바구니 정보를 반환한다', async () => {
        const buyer = await seedBuyer();
        await seedCart(buyer.id);

        const res = await request(app)
          .get('/api/cart')
          .set(authHeader(buyer.id));
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('buyerId', buyer.id);
        expect(Array.isArray(res.body.items)).toBe(true);
      });

      test('장바구니에 상품이 있으면 items 배열에 상품 정보가 포함된다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품',
          price: 20000,
          content: '상품 설명',
        });

        const cart = await seedCart(buyer.id);
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            sizeId: size.id,
            quantity: 2,
          },
        });

        const res = await request(app)
          .get('/api/cart')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0]).toHaveProperty('product');
        expect(res.body.items[0].product).toHaveProperty('name', '테스트 상품');
        expect(res.body.items[0].product).toHaveProperty('store');
        expect(res.body.items[0].product).toHaveProperty('stocks');
      });

      test('비어있는 장바구니는 빈 itmes 배열을 반환한다', async () => {
        const buyer = await seedBuyer();
        await seedCart(buyer.id);

        const res = await request(app)
          .get('/api/cart')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.items).toEqual([]);
      });

      test('장바구니가 없으면 404를 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .get('/api/cart')
          .set(authHeader(buyer.id));

        expect([404, 400]).toContain(res.status);
      });
    });

    describe('PATCH /api/cart', () => {
      test('상품을 장바구니에 추가하면 200과 CartItemDto 배열을 리턴', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '��스트 상품',
          price: 2000,
        });

        await seedCart(buyer.id);

        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: product.id,
            sizes: [{ sizeId: size.id, quantity: 2 }],
          });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('productId', product.id);
        expect(res.body[0]).toHaveProperty('sizeId', size.id);
        expect(res.body[0]).toHaveProperty('quantity', 2);
      });

      test('여러 사이즈를 동시에 추가할 수 있다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size1 = await seedSize();
        const size2 = await prisma.size.create({
          data: {
            name: 'L',
            nameEn: 'L',
            nameKo: '라지',
          },
        });
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size1.id,
          name: '테스트 상품',
          price: 20000,
        });

        await prisma.productStock.create({
          data: {
            productId: product.id,
            sizeId: size2.id,
            quantity: 50,
          },
        });

        await seedCart(buyer.id);

        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: product.id,
            sizes: [
              { sizeId: size1.id, quantity: 2 },
              { sizeId: size2.id, quantity: 1 },
            ],
          });

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
      });

      test('같은 상품의 같은 사이즈를 다시 추가하면 수량을 업데이트한다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품',
          price: 20000,
        });

        const cart = await seedCart(buyer.id);

        //첫 번째 추가
        await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: product.id,
            sizes: [{ sizeId: size.id, quantity: 2 }],
          });

        //두 번째 추가
        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: product.id,
            sizes: [{ sizeId: size.id, quantity: 3 }],
          });

        expect(res.status).toBe(200);
        expect(res.body[0].quantity).toBe(3);
      });

      test('productId가 없으면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const size = await seedSize();
        await seedCart(buyer.id);

        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: '',
            sizes: [{ sizeId: size.id, quantity: 2 }],
          });

        expect(res.status).toBe(400);
      });

      test('sizes 배열이 없으면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품',
          price: 50000,
        });

        await seedCart(buyer.id);

        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: product.id,
            sizes: [],
          });

        expect(res.status).toBe(400);
      });

      test('존재하지 않는 상품이면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const size = await seedSize();
        await seedCart(buyer.id);

        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: 'non-existent',
            sizes: [{ sizeId: size.id, quantity: 2 }],
          });

        expect(res.status).toBe(400);
      });

      test('quantity가 정수가 아니면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품',
          price: 50000,
        });

        await seedCart(buyer.id);

        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: product.id,
            sizes: [{ sizeId: size.id, quantity: 2.5 }],
          });

        expect(res.status).toBe(400);
      });

      test('수량이 0 이하면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품',
          price: 20000,
        });

        await seedCart(buyer.id);

        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: product.id,
            sizes: [{ sizeId: size.id, quantity: 0 }],
          });

        expect(res.status).toBe(400);
      });

      test('수량이 999를 초과하면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품',
          price: 20000,
        });

        await seedCart(buyer.id);

        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: product.id,
            sizes: [{ sizeId: size.id, quantity: 1000 }],
          });

        expect(res.status).toBe(400);
      });

      test('장바구니가 없으면 404를 반환한다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품',
          price: 50000,
        });

        // 장바구니 강제 삭제
        await prisma.cartItem.deleteMany({
          where: { cart: { buyerId: buyer.id } },
        });
        await prisma.cart.deleteMany({
          where: { buyerId: buyer.id },
        });

        const res = await request(app)
          .patch('/api/cart')
          .set(authHeader(buyer.id))
          .send({
            productId: product.id,
            sizes: [{ sizeId: size.id, quantity: 2 }],
          });

        expect(res.status).toBe(404);
      });
    });

    describe('GET /api/cart/:cartItemId', () => {
      test('장바구니 아이템 상세 정보를 반환한다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '상세 상품',
          price: 35000,
          content: '상세 설명',
        });

        const cart = await seedCart(buyer.id);

        const cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            sizeId: size.id,
            quantity: 2,
          },
        });

        const res = await request(app)
          .get(`/api/cart/${cartItem.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', cartItem.id);
        expect(res.body).toHaveProperty('product');
        expect(res.body.product).toHaveProperty('name', '상세 상품');
        expect(res.body.product).toHaveProperty('price', 35000);
        expect(res.body).toHaveProperty('cart');
      });

      test('존재하지 않는 아이템이면 404를 반환한다', async () => {
        const buyer = await seedBuyer();
        await seedCart(buyer.id);

        const res = await request(app)
          .get('/api/cart/non-existent-item-id')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(404);
      });

      test('다른 구매자의 아이템이면 조회할 수 없다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '상품',
          price: 20000,
        });

        const cart1 = await seedCart(buyer1.id);

        const cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart1.id,
            productId: product.id,
            sizeId: size.id,
            quantity: 1,
          },
        });

        const res = await request(app)
          .get(`/api/cart/${cartItem.id}`)
          .set(authHeader(buyer2.id));

        expect(res.status).toBe(404);
      });
    });

    describe('DELETE /api/cart/:cartItemId', () => {
      test('장바구니 아이템을 삭제하면 204를 반환한다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '상품',
          price: 20000,
        });

        const cart = await seedCart(buyer.id);

        const cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            sizeId: size.id,
            quantity: 2,
          },
        });

        const res = await request(app)
          .delete(`/api/cart/${cartItem.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(204);
      });

      test('삭제된 아이템은 다시 조회할 수 없다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '상품',
          price: 20000,
        });

        const cart = await seedCart(buyer.id);

        const cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            sizeId: size.id,
            quantity: 1,
          },
        });

        await request(app)
          .delete(`/api/cart/${cartItem.id}`)
          .set(authHeader(buyer.id));

        const res = await request(app)
          .get(`/api/cart/${cartItem.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(404);
      });

      test('존재하지 않는 아이템을 삭제하면 404를 리턴', async () => {
        const buyer = await seedBuyer();
        await seedCart(buyer.id);

        const res = await request(app)
          .delete('/api/cart/non-existent-item-id')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(404);
      });

      test('다른 구매자의 아이템을 삭제할 수 없다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '상품',
          price: 20000,
        });

        const cart1 = await seedCart(buyer1.id);

        const cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart1.id,
            productId: product.id,
            sizeId: size.id,
            quantity: 1,
          },
        });

        const res = await request(app)
          .delete(`/api/cart/${cartItem.id}`)
          .set(authHeader(buyer2.id));

        expect(res.status).toBe(404);
      });
    });
  });
});
