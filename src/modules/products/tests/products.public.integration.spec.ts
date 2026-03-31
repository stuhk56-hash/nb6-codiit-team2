import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import {
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

  describe('인증이 필요하지 않은 상품 API 통합 테스트', () => {
    describe('GET /api/products (공개 조회)', () => {
      test('상품이 없으면 404를 반환한다', async () => {
        const res = await request(app).get('/api/products');
        expect(res.status).toBe(404);
      });

      test('여러 개의 상품이 있으면 list/totalCount를 올바르게 반환한다', async () => {
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();

        await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '상품1',
          price: 1000,
          content: '설명1',
        });
        await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '상품2',
          price: 2000,
          content: '설명2',
        });

        const res = await request(app)
          .get('/api/products')
          .query({ page: 1, pageSize: 10, sort: 'recent' });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.list).toHaveLength(2);
      });

      test('page/pageSize로 페이징이 된다', async () => {
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();

        for (let i = 1; i <= 5; i += 1) {
          await seedProduct({
            storeId: store.id,
            categoryId: category.id,
            sizeId: size.id,
            name: `상품${i}`,
            price: i * 1000,
            content: `설명${i}`,
          });
        }

        const res = await request(app)
          .get('/api/products')
          .query({ page: 2, pageSize: 2, sort: 'recent' });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(5);
        expect(res.body.list).toHaveLength(2);
      });

      test("sort에 'asc' 같은 값은 허용되지 않아 400을 반환한다", async () => {
        const res = await request(app)
          .get('/api/products')
          .query({ page: 1, pageSize: 10, sort: 'asc' });
        expect(res.status).toBe(400);
      });

      test('search 검색은 상품명에 매칭되면 포함된다', async () => {
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();

        await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '레드 셔츠',
          price: 1000,
          content: '붉은색 셔츠',
        });
        await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '블루 팬츠',
          price: 2000,
          content: '파란색 바지',
        });

        const res = await request(app)
          .get('/api/products')
          .query({ page: 1, pageSize: 10, sort: 'recent', search: '셔츠' });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(1);
        expect(res.body.list[0].name).toBe('레드 셔츠');
      });

      test('잘못된 쿼리(page가 숫자가 아님)는 400을 반환한다', async () => {
        const res = await request(app).get('/api/products').query({ page: 'abc' });
        expect(res.status).toBe(400);
      });
    });

    describe('GET /api/products/:productId (공개 상세 조회)', () => {
      test('ID로 상품 상세를 반환한다', async () => {
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '상세 상품',
          price: 35000,
          content: '상세 설명',
        });

        const res = await request(app).get(`/api/products/${product.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(product.id);
        expect(res.body.name).toBe('상세 상품');
      });

      test('존재하지 않는 id면 404를 반환한다', async () => {
        const res = await request(app).get('/api/products/not-exists-id');
        expect(res.status).toBe(404);
      });

      test('SHOES 카테고리 상품 상세 조회 시 sizeGuideType은 SHOES를 반환한다', async () => {
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('shoes');
        const size270 = await prisma.size.create({
          data: {
            name: '270',
            nameEn: '270',
            nameKo: '270',
          },
        });
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size270.id,
          name: '신발 상세 상품',
          price: 35000,
          content: '신발 상세 설명',
        });

        const res = await request(app).get(`/api/products/${product.id}`);

        expect(res.status).toBe(200);
        expect(res.body.sizeGuideType).toBe('SHOES');
      });
    });

    describe('GET /api/products/:productId/inquiries (공개 문의 목록 조회)', () => {
      test('문의가 없으면 빈 목록을 반환한다', async () => {
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('top');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '문의 없는 상품',
          price: 10000,
        });

        const res = await request(app)
          .get(`/api/products/${product.id}/inquiries`)
          .query({ page: 1, pageSize: 10 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ list: [], totalCount: 0 });
      });

      test('page/pageSize로 문의 목록 페이지네이션이 된다', async () => {
        const { store } = await seedSellerAndStore();
        const buyer = await seedBuyer();
        const category = await seedCategory('top');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '문의 많은 상품',
          price: 10000,
        });

        await prisma.inquiry.createMany({
          data: [
            { productId: product.id, buyerId: buyer.id, title: '문의1', content: '내용1' },
            { productId: product.id, buyerId: buyer.id, title: '문의2', content: '내용2' },
            { productId: product.id, buyerId: buyer.id, title: '문의3', content: '내용3' },
          ],
        });

        const res = await request(app)
          .get(`/api/products/${product.id}/inquiries`)
          .query({ page: 1, pageSize: 2, sort: 'recent' });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(3);
        expect(res.body.list).toHaveLength(2);
      });
    });
  });
});
