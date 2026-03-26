import { prisma } from '../../../lib/constants/prismaClient';
import {
  clearReviewTestData,
  createReviewTestApp,
  requestJson,
  seedBuyer,
  seedCategory,
  seedCompletedOrderItem,
  seedProduct,
  seedReview,
  seedSellerAndStore,
  seedSize,
} from './reviews.test-util';

describe('reviews.public.integration', () => {
  const app = createReviewTestApp();

  beforeEach(async () => {
    await clearReviewTestData();
  });

  afterAll(async () => {
    await clearReviewTestData();
    await prisma.$disconnect();
  });

  test('GET /api/review/:reviewId - 리뷰 상세 공개 조회 성공', async () => {
    const { store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const category = await seedCategory();
    const size = await seedSize();
    const product = await seedProduct({
      storeId: store.id,
      categoryId: category.id,
      sizeId: size.id,
      name: '상세 리뷰 상품',
      price: 21000,
    });
    const { orderItem } = await seedCompletedOrderItem({
      buyerId: buyer.id,
      productId: product.id,
      sizeId: size.id,
      productName: product.name,
      unitPrice: 21000,
      quantity: 2,
    });
    const review = await seedReview({
      buyerId: buyer.id,
      productId: product.id,
      orderItemId: orderItem.id,
      rating: 5,
      content: '아주 만족합니다.',
    });

    const res = await requestJson(app, {
      method: 'GET',
      path: `/api/review/${review.id}`,
    });

    expect(res.status).toBe(200);
    expect(res.body.reviewId).toBe(review.id);
    expect(res.body.productName).toBe('상세 리뷰 상품');
    expect(res.body.rating).toBe(5);
    expect(res.body.content).toBe('아주 만족합니다.');
    expect(res.body.size.ko).toBe(size.nameKo);
    expect(res.body.price).toBe(21000);
    expect(res.body.quantity).toBe(2);
    expect(res.body.reviewer).toBe(buyer.name);
  });

  test('GET /api/product/:productId/reviews - 리뷰 목록 공개 조회 성공', async () => {
    const { store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const category = await seedCategory();
    const size = await seedSize();
    const product = await seedProduct({
      storeId: store.id,
      categoryId: category.id,
      sizeId: size.id,
    });
    const { orderItem } = await seedCompletedOrderItem({
      buyerId: buyer.id,
      productId: product.id,
      sizeId: size.id,
      productName: product.name,
    });
    await seedReview({
      buyerId: buyer.id,
      productId: product.id,
      orderItemId: orderItem.id,
      rating: 4,
      content: '공개 리뷰 조회',
    });

    const res = await requestJson(app, {
      method: 'GET',
      path: `/api/product/${product.id}/reviews`,
      query: { page: 1, limit: 5 },
    });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].productId).toBe(product.id);
    expect(res.body.items[0].user.name).toBe(buyer.name);
    expect(res.body.meta).toEqual({
      total: 1,
      page: 1,
      limit: 5,
      hasNextPage: false,
    });
  });
});
