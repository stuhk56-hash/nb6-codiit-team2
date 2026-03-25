import { prisma } from '../../../lib/constants/prismaClient';
import {
  authHeader,
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

describe('reviews.auth.integration', () => {
  const app = createReviewTestApp();

  beforeEach(async () => {
    await clearReviewTestData();
  });

  afterAll(async () => {
    await clearReviewTestData();
    await prisma.$disconnect();
  });

  test('PATCH /api/review/:reviewId - 작성자만 수정 가능하다', async () => {
    const { store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const anotherBuyer = await seedBuyer();
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
    const review = await seedReview({
      buyerId: buyer.id,
      productId: product.id,
      orderItemId: orderItem.id,
    });

    const forbiddenRes = await requestJson(app, {
      method: 'PATCH',
      path: `/api/review/${review.id}`,
      headers: authHeader(anotherBuyer.id),
      body: { rating: 3 },
    });

    expect(forbiddenRes.status).toBe(403);

    const successRes = await requestJson(app, {
      method: 'PATCH',
      path: `/api/review/${review.id}`,
      headers: authHeader(buyer.id),
      body: { rating: 4, content: '수정된 리뷰' },
    });

    expect(successRes.status).toBe(200);
    expect(successRes.body.rating).toBe(4);
    expect(successRes.body.content).toBe('수정된 리뷰');
  });

  test('DELETE /api/review/:reviewId - 작성자만 삭제 가능하다', async () => {
    const { store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const anotherBuyer = await seedBuyer();
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
    const review = await seedReview({
      buyerId: buyer.id,
      productId: product.id,
      orderItemId: orderItem.id,
    });

    const forbiddenRes = await requestJson(app, {
      method: 'DELETE',
      path: `/api/review/${review.id}`,
      headers: authHeader(anotherBuyer.id),
    });

    expect(forbiddenRes.status).toBe(403);

    const successRes = await requestJson(app, {
      method: 'DELETE',
      path: `/api/review/${review.id}`,
      headers: authHeader(buyer.id),
    });

    expect(successRes.status).toBe(204);
  });

  test('POST /api/product/:productId/reviews - 구매자 리뷰 작성 성공', async () => {
    const { seller, store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const category = await seedCategory();
    const size = await seedSize();
    const product = await seedProduct({
      storeId: store.id,
      categoryId: category.id,
      sizeId: size.id,
      name: '리뷰 작성 상품',
    });
    const { orderItem } = await seedCompletedOrderItem({
      buyerId: buyer.id,
      productId: product.id,
      sizeId: size.id,
      productName: product.name,
    });

    const forbiddenRes = await requestJson(app, {
      method: 'POST',
      path: `/api/product/${product.id}/reviews`,
      headers: authHeader(seller.id),
      body: {
        orderItemId: orderItem.id,
        rating: 5,
        content: '권한 없는 요청',
      },
    });

    expect(forbiddenRes.status).toBe(403);

    const successRes = await requestJson(app, {
      method: 'POST',
      path: `/api/product/${product.id}/reviews`,
      headers: authHeader(buyer.id),
      body: {
        orderItemId: orderItem.id,
        rating: 5,
        content: '리뷰 작성 성공',
      },
    });

    expect(successRes.status).toBe(201);
    expect(successRes.body.productId).toBe(product.id);
    expect(successRes.body.userId).toBe(buyer.id);
    expect(successRes.body.content).toBe('리뷰 작성 성공');
  });
});
