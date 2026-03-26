import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  authHeader,
  clearProductTestData,
  createTestApp,
  seedBuyer,
  seedCategory,
  seedProduct,
  seedSellerAndStore,
  seedSize,
} from './products.test-util';

describe('상품 API 통합 테스트', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await clearProductTestData();
  });

  afterAll(async () => {
    await clearProductTestData();
    await prisma.$disconnect();
  });

  describe('인증이 필요한 상품 API 통합 테스트', () => {
    describe('POST /api/products', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).post('/api/products').send({
          name: '신규 상품',
          price: 10000,
          categoryName: 'top',
          stocks: [{ sizeId: 1, quantity: 10 }],
        });

        expect(res.status).toBe(401);
      });

      test('판매자 토큰으로 요청하면 201과 상품 정보를 반환한다', async () => {
        const { seller } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();

        const res = await request(app)
          .post('/api/products')
          .set(authHeader(seller.id))
          .send({
            name: '신규 상품',
            price: 10000,
            categoryName: category.name,
            stocks: [{ sizeId: size.id, quantity: 10 }],
            sizeSpecs: [
              {
                sizeLabel: 'M',
                totalLengthCm: 70,
                shoulderCm: 45,
                chestCm: 52,
                sleeveCm: 60,
              },
            ],
          });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('신규 상품');
      });

      test('TOP 계열 카테고리에서 sizeSpecs 없이 생성하면 400을 반환한다', async () => {
        const { seller } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();

        const res = await request(app)
          .post('/api/products')
          .set(authHeader(seller.id))
          .send({
            name: '신규 상품',
            price: 10000,
            categoryName: category.name,
            stocks: [{ sizeId: size.id, quantity: 10 }],
          });

        expect(res.status).toBe(400);
      });

      test('SHOES 카테고리에서는 sizeSpecs 없이 생성해도 201을 반환한다', async () => {
        const { seller } = await seedSellerAndStore();
        const category = await seedCategory('shoes');
        const size = await seedSize();

        const res = await request(app)
          .post('/api/products')
          .set(authHeader(seller.id))
          .send({
            name: '신규 신발',
            price: 12000,
            categoryName: category.name,
            stocks: [{ sizeId: size.id, quantity: 5 }],
          });

        expect(res.status).toBe(201);
      });
    });

    describe('PATCH /api/products/:productId', () => {
      test('상품 소유 판매자가 수정하면 200을 반환한다', async () => {
        const { seller, store } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '기존 상품',
          price: 10000,
          content: '기존 설명',
        });

        const res = await request(app)
          .patch(`/api/products/${product.id}`)
          .set(authHeader(seller.id))
          .send({
            name: '수정 상품',
            stocks: [{ sizeId: size.id, quantity: 3 }],
            sizeSpecs: [
              {
                sizeLabel: 'M',
                totalLengthCm: 72,
                shoulderCm: 46,
                chestCm: 53,
                sleeveCm: 61,
              },
            ],
          });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('수정 상품');
      });

      test('다른 판매자가 수정하면 403을 반환한다', async () => {
        const { store } = await seedSellerAndStore();
        const { seller: anotherSeller } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '기존 상품',
          price: 10000,
        });

        const res = await request(app)
          .patch(`/api/products/${product.id}`)
          .set(authHeader(anotherSeller.id))
          .send({
            name: '권한 없는 수정',
            stocks: [{ sizeId: size.id, quantity: 1 }],
          });

        expect(res.status).toBe(403);
      });
    });

    describe('DELETE /api/products/:productId', () => {
      test('상품 소유 판매자가 삭제하면 204를 반환한다', async () => {
        const { seller, store } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '삭제 대상 상품',
          price: 10000,
        });

        const res = await request(app)
          .delete(`/api/products/${product.id}`)
          .set(authHeader(seller.id));

        expect(res.status).toBe(204);
      });

      test('다른 판매자가 삭제하면 403을 반환한다', async () => {
        const { store } = await seedSellerAndStore();
        const { seller: anotherSeller } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '삭제 대상 상품',
          price: 10000,
        });

        const res = await request(app)
          .delete(`/api/products/${product.id}`)
          .set(authHeader(anotherSeller.id));

        expect(res.status).toBe(403);
      });
    });

    describe('POST /api/products/:productId/inquiries', () => {
      test('구매자가 문의를 등록하면 201을 반환한다', async () => {
        const { store } = await seedSellerAndStore();
        const buyer = await seedBuyer();
        const category = await seedCategory('top');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '문의 상품',
          price: 10000,
        });

        const res = await request(app)
          .post(`/api/products/${product.id}/inquiries`)
          .set(authHeader(buyer.id))
          .send({
            title: '배송 문의',
            content: '언제 오나요?',
            isSecret: true,
          });

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('배송 문의');
      });

      test('판매자가 문의를 등록하면 403을 반환한다', async () => {
        const { seller, store } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '문의 상품',
          price: 10000,
        });

        const res = await request(app)
          .post(`/api/products/${product.id}/inquiries`)
          .set(authHeader(seller.id))
          .send({
            title: '권한 없는 문의',
            content: '내용',
            isSecret: false,
          });

        expect(res.status).toBe(403);
      });
    });
  });
});
