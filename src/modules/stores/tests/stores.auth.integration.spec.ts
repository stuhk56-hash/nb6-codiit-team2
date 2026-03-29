import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  authHeader,
  clearStoreTestData,
  createBuyer,
  createCategory,
  createSeller,
  createSize,
  createStore,
  createTestApp,
} from './stores.test-util';

describe('스토어 API 통합 테스트', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await clearStoreTestData();
  });

  afterAll(async () => {
    await clearStoreTestData();
    await prisma.$disconnect();
  });

  describe('인증이 필요한 스토어 API 통합 테스트', () => {
    describe('POST /api/stores', () => {
      test('로그인 없이 요청하면 401을 반환한다', async () => {
        const res = await request(app).post('/api/stores').send({
          name: '신규 스토어',
          address: '서울시 강남구',
          detailAddress: '101호',
          phoneNumber: '010-1111-2222',
          content: '소개',
        });

        expect(res.status).toBe(401);
      });

      test('판매자 토큰으로 요청하면 201과 스토어 정보를 반환한다', async () => {
        const seller = await createSeller();

        const res = await request(app)
          .post('/api/stores')
          .set(authHeader(seller.id))
          .send({
            name: '신규 스토어',
            address: '서울시 강남구',
            detailAddress: '101호',
            phoneNumber: '010-1111-2222',
            content: '소개',
          });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('신규 스토어');
      });

      test('사업자등록번호 형식이 잘못되면 400을 반환한다', async () => {
        const seller = await createSeller();

        const res = await request(app)
          .post('/api/stores')
          .set(authHeader(seller.id))
          .send({
            name: '신규 스토어',
            address: '서울시 강남구',
            detailAddress: '101호',
            phoneNumber: '010-1111-2222',
            content: '소개',
            businessRegistrationNumber: '111-11-11111',
          });

        expect(res.status).toBe(400);
      });
    });

    describe('GET /api/stores/detail/my', () => {
      test('판매자 본인 스토어를 반환한다', async () => {
        const seller = await createSeller();
        await createStore(seller.id, '내 스토어');

        const res = await request(app)
          .get('/api/stores/detail/my')
          .set(authHeader(seller.id));

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('내 스토어');
      });

      test('구매자 토큰으로 요청하면 403을 반환한다', async () => {
        const buyer = await createBuyer();

        const res = await request(app)
          .get('/api/stores/detail/my')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(403);
      });
    });

    describe('GET /api/stores/detail/my/product', () => {
      test('내 스토어 상품 목록을 페이지네이션으로 반환한다', async () => {
        const seller = await createSeller();
        const store = await createStore(seller.id);
        const category = await createCategory();
        const size = await createSize();

        for (let i = 1; i <= 3; i += 1) {
          await prisma.product.create({
            data: {
              storeId: store.id,
              categoryId: category.id,
              name: `상품${i}`,
              price: i * 1000,
              stocks: {
                create: [{ sizeId: size.id, quantity: 10 }],
              },
            },
          });
        }

        const res = await request(app)
          .get('/api/stores/detail/my/product')
          .set(authHeader(seller.id))
          .query({ page: 1, pageSize: 2 });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(3);
        expect(res.body.list).toHaveLength(2);
      });
    });

    describe('PATCH /api/stores/:storeId', () => {
      test('본인 스토어를 수정하면 200을 반환한다', async () => {
        const seller = await createSeller();
        const store = await createStore(seller.id, '수정 전 스토어');

        const res = await request(app)
          .patch(`/api/stores/${store.id}`)
          .set(authHeader(seller.id))
          .send({
            name: '수정 후 스토어',
            content: '수정된 소개',
          });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('수정 후 스토어');
        expect(res.body.content).toBe('수정된 소개');
      });

      test('다른 판매자가 수정하면 403을 반환한다', async () => {
        const owner = await createSeller();
        const anotherSeller = await createSeller();
        const store = await createStore(owner.id);

        const res = await request(app)
          .patch(`/api/stores/${store.id}`)
          .set(authHeader(anotherSeller.id))
          .send({
            name: '권한 없는 수정',
          });

        expect(res.status).toBe(403);
      });

      test('수정 입력이 비어 있으면 400을 반환한다', async () => {
        const seller = await createSeller();
        const store = await createStore(seller.id);

        const res = await request(app)
          .patch(`/api/stores/${store.id}`)
          .set(authHeader(seller.id))
          .send({});

        expect(res.status).toBe(400);
      });

      test('통신판매업 신고번호 형식이 잘못되면 400을 반환한다', async () => {
        const seller = await createSeller();
        const store = await createStore(seller.id);

        const res = await request(app)
          .patch(`/api/stores/${store.id}`)
          .set(authHeader(seller.id))
          .send({
            mailOrderSalesNumber: '서울강남-1234',
          });

        expect(res.status).toBe(400);
      });
    });

    describe('POST/DELETE /api/stores/:storeId/favorite', () => {
      test('즐겨찾기 등록/해제가 동작한다', async () => {
        const seller = await createSeller();
        const buyer = await createBuyer();
        const store = await createStore(seller.id);

        const registerRes = await request(app)
          .post(`/api/stores/${store.id}/favorite`)
          .set(authHeader(buyer.id));

        expect(registerRes.status).toBe(201);
        expect(registerRes.body.type).toBe('register');

        const deleteRes = await request(app)
          .delete(`/api/stores/${store.id}/favorite`)
          .set(authHeader(buyer.id));

        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.type).toBe('delete');
      });
    });
  });
});
