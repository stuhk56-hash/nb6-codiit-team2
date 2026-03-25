import { prisma } from '../../../lib/constants/prismaClient';
import {
  authHeader,
  clearDashboardTestData,
  createDashboardTestApp,
  requestJson,
  seedBuyer,
  seedCategory,
  seedCompletedSale,
  seedProduct,
  seedSellerAndStore,
  seedSize,
} from './dashboard.test-util';

describe('dashboard.auth.integration', () => {
  const app = createDashboardTestApp();

  beforeEach(async () => {
    await clearDashboardTestData();
  });

  afterAll(async () => {
    await clearDashboardTestData();
    await prisma.$disconnect();
  });

  test('GET /api/dashboard - 판매자 인증 시 조회 성공', async () => {
    const { seller, store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const category = await seedCategory();
    const size = await seedSize();
    const product = await seedProduct({
      storeId: store.id,
      categoryId: category.id,
      sizeId: size.id,
      name: '대시보드 상품',
      price: 30000,
    });
    await seedCompletedSale({
      buyerId: buyer.id,
      productId: product.id,
      sizeId: size.id,
      productName: product.name,
      unitPrice: 30000,
      quantity: 2,
    });

    const res = await requestJson(app, {
      method: 'GET',
      path: '/api/dashboard',
      headers: authHeader(seller.id),
    });

    expect(res.status).toBe(200);
    expect(res.body.today.current.totalOrders).toBeGreaterThanOrEqual(2);
    expect(res.body.topSales[0].product.id).toBe(product.id);
    expect(Array.isArray(res.body.priceRange)).toBe(true);
  });

  test('GET /api/dashboard - 구매자 요청 시 403 반환', async () => {
    const buyer = await seedBuyer();

    const res = await requestJson(app, {
      method: 'GET',
      path: '/api/dashboard',
      headers: authHeader(buyer.id),
    });

    expect(res.status).toBe(403);
  });
});
