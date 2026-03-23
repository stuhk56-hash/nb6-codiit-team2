import request from 'supertest';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  authHeader,
  clearOrdersTestData,
  createTestApp,
  seedBuyer,
  seedCategory,
  seedProduct,
  seedSellerAndStore,
  seedSize,
  seedOrder,
  seedPayment,
  seedSeller,
} from './orders.test-util';

describe('주문 API 통합 테스트', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await clearOrdersTestData();
  });

  afterAll(async () => {
    await clearOrdersTestData();
    await prisma.$disconnect();
  });

  describe('인증이 필요한 주문 API 통합 테스트', () => {
    describe('POST /api/orders', () => {
      test('구매자가 주문을 생성하면 201과 주문 정보를 반환한다', async () => {
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

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 2 },
            ],
            usePoint: 1000,
          });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('buyerName', '홍길동');
        expect(res.body).toHaveProperty('orderItems');
        expect(res.body.orderItems).toHaveLength(1);
      });

      test('판매자는 주문을 생성할 수 없다', async () => {
        const seller = await seedSeller();
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

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(seller.id))
          .send({
            name: '판매자',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 1 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(403);
      });

      test('배송 정보가 없으면 400을 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [],
            usePoint: 0,
          });

        expect(res.status).toBe(400);
      });

      test('주문 아이템이 없으면 400을 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [],
            usePoint: 0,
          });

        expect(res.status).toBe(400);
      });

      test('재고 정보가 없으면 404를 반환한다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();

        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '재고 없는 상품',
          price: 50000,
        });

        await prisma.productStock.deleteMany({
          where: {
            productId: product.id,
            sizeId: size.id,
          },
        });

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 1 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(404);
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

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 2.5 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(400);
      });

      test('quantity가 0이면 400을 반환한다', async () => {
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

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 0 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(400);
      });

      test('quantity가 999를 초과하면 400을 반환한다', async () => {
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

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 1000 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(400);
      });

      test('재고가 부족하면 409를 반환한다', async () => {
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

        // 재고를 1개로 줄임
        await prisma.productStock.updateMany({
          where: { productId: product.id },
          data: { quantity: 1 },
        });

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 5 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(409);
      });

      test('존재하지 않는 상품이면 404를 반환한다', async () => {
        const buyer = await seedBuyer();
        const size = await seedSize();

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: 'non-existent', sizeId: size.id, quantity: 1 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(404);
      });

      test('포인트를 초과하면 400을 반환한다', async () => {
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

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 2 },
            ],
            usePoint: 200000,
          });

        expect(res.status).toBe(400);
      });

      test('포인트가 음수면 400을 반환한다', async () => {
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

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 1 },
            ],
            usePoint: -1000,
          });

        expect(res.status).toBe(400);
      });

      test('여러 상품을 동시에 주문할 수 있다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product1 = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품 1',
          price: 30000,
        });
        const product2 = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품 2',
          price: 20000,
        });

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product1.id, sizeId: size.id, quantity: 1 },
              { productId: product2.id, sizeId: size.id, quantity: 2 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(201);
        expect(res.body.orderItems).toHaveLength(2);
      });

      test('리뷰가 있는 상품을 주문할 수 있다', async () => {
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

        // 리뷰 추가
        await prisma.review.create({
          data: {
            buyerId: buyer.id,
            productId: product.id,
            rating: 5,
            content: '좋은 상품입니다',
          },
        });

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 1 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(201);
        expect(res.body.orderItems[0].product.reviews).toHaveLength(1);
        expect(res.body.orderItems[0].product.reviews[0]).toHaveProperty(
          'rating',
          5,
        );
      });

      test('등급이 상승하는 주문을 생성할 수 있다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();

        // 높은 금액의 상품 생성
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '고가 상품',
          price: 500000,
        });

        // 더 높은 등급 생성
        await prisma.grade.create({
          data: {
            id: `grade_high_${Date.now()}`,
            name: `high_grade_${Date.now()}`,
            minAmount: 1000000,
            rate: 10,
          },
        });

        // 초기 등급 설정
        await prisma.user.update({
          where: { id: buyer.id },
          data: { lifetimeSpend: 600000 },
        });

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 1 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(201);

        // 사용자의 lifetimeSpend 확인
        const updatedBuyer = await prisma.user.findUnique({
          where: { id: buyer.id },
        });
        expect(updatedBuyer!.lifetimeSpend).toBeGreaterThan(600000);
      });

      test('포인트 0으로 주문할 수 있다', async () => {
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

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 1 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('usedPoints', 0);
      });

      test('상품이미지가 없는 상품을 주문할 수 있다', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '이미지 없는 상품',
          price: 30000,
          imageUrl: undefined,
        });

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 1 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(201);
        expect(res.body.orderItems[0]).toHaveProperty('product');
      });

      test('주문 중에 재고가 부족해지면 ��러를 반환한다', async () => {
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

        // 재고를 정확히 5개로 설정
        await prisma.productStock.updateMany({
          where: { productId: product.id },
          data: { quantity: 5 },
        });

        // 첫 번째 요청: 3개 주문 (성공)
        const res1 = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 3 },
            ],
            usePoint: 0,
          });

        expect(res1.status).toBe(201);

        // 남은 재고: 2개
        // 두 번째 요청: 5개 주문 (재고 부족으로 실패)
        const res2 = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 5 },
            ],
            usePoint: 0,
          });

        expect(res2.status).toBe(409);
      });

      test('트랜잭션 중 재고 변경으로 인한 재고 부족 처리', async () => {
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

        // 재고를 10개로 설정
        await prisma.productStock.updateMany({
          where: { productId: product.id },
          data: { quantity: 10 },
        });

        // 다른 구매자가 동시에 주문하는 상황 시뮬레이션
        const buyer2 = await seedBuyer();

        // buyer2가 8개 주문
        await request(app)
          .post('/api/orders')
          .set(authHeader(buyer2.id))
          .send({
            name: '김철수',
            phone: '010-8765-4321',
            address: '부산시 해운대구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 8 },
            ],
            usePoint: 0,
          });

        // 남은 재고: 2개
        // buyer가 5개 주문 시도 (재고 부족)
        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 5 },
            ],
            usePoint: 0,
          });

        expect(res.status).toBe(409);
      });

      test('여러 상품 주문 중 일부만 재고 부족인 경우', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();

        const product1 = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '충분한 상품',
          price: 30000,
        });

        const product2 = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '부족한 상품',
          price: 50000,
        });

        // product2의 재고를 1개로 설정
        await prisma.productStock.updateMany({
          where: { productId: product2.id },
          data: { quantity: 1 },
        });

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product1.id, sizeId: size.id, quantity: 2 },
              { productId: product2.id, sizeId: size.id, quantity: 5 },
            ],
            usePoint: 0,
          });

        // product2의 재고 부족으로 실패
        expect(res.status).toBe(409);
      });

      test('사용자 정보가 올바르게 업데이트되는 주문', async () => {
        const buyer = await seedBuyer();
        const { store } = await seedSellerAndStore();
        const category = await seedCategory('TOP');
        const size = await seedSize();
        const product = await seedProduct({
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          name: '테스트 상품',
          price: 100000,
        });

        const initialBuyer = await prisma.user.findUnique({
          where: { id: buyer.id },
        });

        const res = await request(app)
          .post('/api/orders')
          .set(authHeader(buyer.id))
          .send({
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            orderItems: [
              { productId: product.id, sizeId: size.id, quantity: 1 },
            ],
            usePoint: 10000,
          });

        expect(res.status).toBe(201);

        // 사용자 정보 확인
        const updatedBuyer = await prisma.user.findUnique({
          where: { id: buyer.id },
          include: { grade: true },
        });

        // 포인트 차감 확인
        expect(updatedBuyer!.points).toBeLessThan(initialBuyer!.points);
        // lifetimeSpend 증가 확인
        expect(updatedBuyer!.lifetimeSpend).toBeGreaterThan(0);
      });
    });

    describe('GET /api/orders', () => {
      test('구매자의 주문 목록을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({ orderId: order.id, price: 100000 });

        const res = await request(app)
          .get('/api/orders')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('meta');
        expect(res.body.data).toHaveLength(1);
      });

      test('페이지네이션이 작동한다', async () => {
        const buyer = await seedBuyer();

        for (let i = 0; i < 15; i++) {
          const order = await seedOrder({
            buyerId: buyer.id,
            buyerName: `홍길동${i}`,
            phoneNumber: '010-1234-5678',
            address: '서울시 강남구',
          });
          await seedPayment({ orderId: order.id, price: 100000 });
        }

        const res = await request(app)
          .get('/api/orders?limit=10&page=1')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(10);
        expect(res.body.meta).toHaveProperty('total', 15);
        expect(res.body.meta).toHaveProperty('totalPages', 2);
      });

      test('다음 페이지를 조회할 수 있다', async () => {
        const buyer = await seedBuyer();

        for (let i = 0; i < 15; i++) {
          const order = await seedOrder({
            buyerId: buyer.id,
            buyerName: `홍길동${i}`,
            phoneNumber: '010-1234-5678',
            address: '서울시 강남구',
          });
          await seedPayment({ orderId: order.id, price: 100000 });
        }

        const res = await request(app)
          .get('/api/orders?limit=10&page=2')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(5);
        expect(res.body.meta).toHaveProperty('page', 2);
      });

      test('상태 필터링이 작동한다', async () => {
        const buyer = await seedBuyer();
        const order1 = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({
          orderId: order1.id,
          price: 100000,
          status: 'Paid',
        });

        const order2 = await seedOrder({
          buyerId: buyer.id,
          buyerName: '김철수',
          phoneNumber: '010-8765-4321',
          address: '부산시 해운대구',
        });
        await seedPayment({
          orderId: order2.id,
          price: 50000,
          status: 'Pending',
        });

        const res = await request(app)
          .get('/api/orders?status=Paid')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]).toHaveProperty('payments');
        expect(res.body.data[0].payments).toHaveProperty('status', 'Paid');
      });

      test('빈 주문 목록을 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .get('/api/orders')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
        expect(res.body.meta).toHaveProperty('total', 0);
      });
    });

    describe('GET /api/orders/:orderId', () => {
      test('주문 상세 정보를 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({ orderId: order.id, price: 100000 });

        const res = await request(app)
          .get(`/api/orders/${order.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', order.id);
        expect(res.body).toHaveProperty('buyerName', '홍길동');
        expect(res.body).toHaveProperty('payments');
      });

      test('존재하지 않는 주문이면 404를 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .get('/api/orders/non-existent-order')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(404);
      });

      test('다른 구매자의 주문을 조회하면 400을 반환한다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer1.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({ orderId: order.id, price: 100000 });

        const res = await request(app)
          .get(`/api/orders/${order.id}`)
          .set(authHeader(buyer2.id));

        expect(res.status).toBe(400);
      });
    });

    describe('PATCH /api/orders/:orderId', () => {
      test('주문 정보를 수정하면 200과 수정된 주문 정보를 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({ orderId: order.id, price: 100000 });

        const res = await request(app)
          .patch(`/api/orders/${order.id}`)
          .set(authHeader(buyer.id))
          .send({
            name: '신길동',
            phone: '010-9999-9999',
            address: '인천시 남동구',
          });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('buyerName', '신길동');
        expect(res.body).toHaveProperty('phoneNumber', '010-9999-9999');
        expect(res.body).toHaveProperty('address', '인천시 남동구');
      });

      test('일부 필드만 수정할 수 있다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({ orderId: order.id, price: 100000 });

        const res = await request(app)
          .patch(`/api/orders/${order.id}`)
          .set(authHeader(buyer.id))
          .send({
            name: '신길동',
          });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('buyerName', '신길동');
        expect(res.body).toHaveProperty('phoneNumber', '010-1234-5678');
      });

      test('존재하지 않는 주문을 수정하면 404를 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .patch('/api/orders/non-existent-order')
          .set(authHeader(buyer.id))
          .send({
            name: '신길동',
            phone: '010-9999-9999',
            address: '인천시 남동구',
          });

        expect(res.status).toBe(404);
      });

      test('다른 구매자의 주문을 수정하면 400을 반환한다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer1.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({ orderId: order.id, price: 100000 });

        const res = await request(app)
          .patch(`/api/orders/${order.id}`)
          .set(authHeader(buyer2.id))
          .send({
            name: '신길동',
            phone: '010-9999-9999',
            address: '인천시 남동구',
          });

        expect(res.status).toBe(400);
      });
    });

    describe('DELETE /api/orders/:orderId', () => {
      test('주문을 취소하면 200과 메시지를 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
          usedPoints: 1000,
        });
        await seedPayment({
          orderId: order.id,
          price: 99000,
          status: 'Pending',
        });

        const res = await request(app)
          .delete(`/api/orders/${order.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
      });

      test('존재하지 않는 주문을 취소하면 404를 반환한다', async () => {
        const buyer = await seedBuyer();

        const res = await request(app)
          .delete('/api/orders/non-existent-order')
          .set(authHeader(buyer.id));

        expect(res.status).toBe(404);
      });

      test('다른 구매자의 주문을 취소하면 400을 반환한다', async () => {
        const buyer1 = await seedBuyer();
        const buyer2 = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer1.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({
          orderId: order.id,
          price: 100000,
          status: 'Pending',
        });

        const res = await request(app)
          .delete(`/api/orders/${order.id}`)
          .set(authHeader(buyer2.id));

        expect(res.status).toBe(400);
      });

      test('Paid 상태 주문을 취소하면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({ orderId: order.id, price: 100000, status: 'Paid' });

        const res = await request(app)
          .delete(`/api/orders/${order.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(400);
      });

      test('Failed 상태 주문을 취소하면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
        });
        await seedPayment({
          orderId: order.id,
          price: 100000,
          status: 'Failed',
        });

        const res = await request(app)
          .delete(`/api/orders/${order.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(400);
      });

      test('Canceled 상태 주문을 취소하면 400을 반환한다', async () => {
        const buyer = await seedBuyer();
        const order = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울�� 강남구',
        });
        await seedPayment({
          orderId: order.id,
          price: 100000,
          status: 'Canceled',
        });

        const res = await request(app)
          .delete(`/api/orders/${order.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(400);
      });

      test('포인트를 사용한 주문을 취소하면 포인트가 복구된다', async () => {
        const buyer = await seedBuyer();
        const initialPoints = buyer.points;
        const order = await seedOrder({
          buyerId: buyer.id,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
          usedPoints: 5000,
        });
        await seedPayment({
          orderId: order.id,
          price: 95000,
          status: 'Pending',
        });

        const res = await request(app)
          .delete(`/api/orders/${order.id}`)
          .set(authHeader(buyer.id));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');

        // 사용자의 포인트 확인
        const updatedBuyer = await prisma.user.findUnique({
          where: { id: buyer.id },
        });
        // 포인트가 복구되어야 함
        expect(updatedBuyer!.points).toBe(initialPoints + 5000);
      });
    });
  });
});
