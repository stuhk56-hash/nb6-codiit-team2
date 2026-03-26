import { prisma } from '../../../lib/constants/prismaClient';
import {
  authHeader,
  clearInquiryTestData,
  createInquiryTestApp,
  requestJson,
  seedBuyer,
  seedCategory,
  seedInquiry,
  seedInquiryReply,
  seedProduct,
  seedSellerAndStore,
  seedSize,
} from './inquiries.test-util';

describe('inquiries.auth.integration', () => {
  const app = createInquiryTestApp();

  beforeEach(async () => {
    await clearInquiryTestData();
  });

  afterAll(async () => {
    await clearInquiryTestData();
    await prisma.$disconnect();
  });

  test('GET /api/inquiries - 내 문의 목록 조회 성공', async () => {
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
    await seedInquiry({
      productId: product.id,
      buyerId: buyer.id,
      title: '내 문의',
    });
    await seedInquiry({
      productId: product.id,
      buyerId: anotherBuyer.id,
      title: '남의 문의',
    });

    const res = await requestJson(app, {
      method: 'GET',
      path: '/api/inquiries',
      headers: authHeader(buyer.id),
    });

    expect(res.status).toBe(200);
    expect(res.body.totalCount).toBe(1);
    expect(res.body.list[0].title).toBe('내 문의');
  });

  test('GET /api/inquiries/:inquiryId - 문의 상세 조회 권한 검증', async () => {
    const { seller, store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const anotherBuyer = await seedBuyer();
    const category = await seedCategory();
    const size = await seedSize();
    const product = await seedProduct({
      storeId: store.id,
      categoryId: category.id,
      sizeId: size.id,
    });
    const inquiry = await seedInquiry({
      productId: product.id,
      buyerId: buyer.id,
      isSecret: true,
    });

    const forbiddenRes = await requestJson(app, {
      method: 'GET',
      path: `/api/inquiries/${inquiry.id}`,
      headers: authHeader(anotherBuyer.id),
    });

    expect(forbiddenRes.status).toBe(403);

    const sellerRes = await requestJson(app, {
      method: 'GET',
      path: `/api/inquiries/${inquiry.id}`,
      headers: authHeader(seller.id),
    });

    expect(sellerRes.status).toBe(200);
    expect(sellerRes.body.id).toBe(inquiry.id);
  });

  test('PATCH /api/inquiries/:inquiryId - 답변 완료된 문의 수정 차단', async () => {
    const { store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const category = await seedCategory();
    const size = await seedSize();
    const product = await seedProduct({
      storeId: store.id,
      categoryId: category.id,
      sizeId: size.id,
    });
    const inquiry = await seedInquiry({
      productId: product.id,
      buyerId: buyer.id,
      status: 'CompletedAnswer',
    });

    const res = await requestJson(app, {
      method: 'PATCH',
      path: `/api/inquiries/${inquiry.id}`,
      headers: authHeader(buyer.id),
      body: {
        title: '수정 시도',
      },
    });

    expect(res.status).toBe(400);
  });

  test('DELETE /api/inquiries/:inquiryId - 작성자만 삭제 가능', async () => {
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
    const inquiry = await seedInquiry({
      productId: product.id,
      buyerId: buyer.id,
    });

    const forbiddenRes = await requestJson(app, {
      method: 'DELETE',
      path: `/api/inquiries/${inquiry.id}`,
      headers: authHeader(anotherBuyer.id),
    });

    expect(forbiddenRes.status).toBe(403);

    const successRes = await requestJson(app, {
      method: 'DELETE',
      path: `/api/inquiries/${inquiry.id}`,
      headers: authHeader(buyer.id),
    });

    expect(successRes.status).toBe(200);
    expect(successRes.body.id).toBe(inquiry.id);
  });

  test('POST /api/inquiries/:inquiryId/replies - 판매자 답변 생성 성공', async () => {
    const { seller, store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const category = await seedCategory();
    const size = await seedSize();
    const product = await seedProduct({
      storeId: store.id,
      categoryId: category.id,
      sizeId: size.id,
    });
    const inquiry = await seedInquiry({
      productId: product.id,
      buyerId: buyer.id,
    });

    const res = await requestJson(app, {
      method: 'POST',
      path: `/api/inquiries/${inquiry.id}/replies`,
      headers: authHeader(seller.id),
      body: {
        content: '답변 등록',
      },
    });

    expect(res.status).toBe(201);
    expect(res.body.inquiryId).toBe(inquiry.id);
    expect(res.body.userId).toBe(seller.id);
    expect(res.body.content).toBe('답변 등록');
  });

  test('PATCH /api/inquiries/:replyId/replies - 답변 수정 성공', async () => {
    const { seller, store } = await seedSellerAndStore();
    const buyer = await seedBuyer();
    const category = await seedCategory();
    const size = await seedSize();
    const product = await seedProduct({
      storeId: store.id,
      categoryId: category.id,
      sizeId: size.id,
    });
    const inquiry = await seedInquiry({
      productId: product.id,
      buyerId: buyer.id,
    });
    const reply = await seedInquiryReply({
      inquiryId: inquiry.id,
      sellerId: seller.id,
      content: '기존 답변',
    });

    const res = await requestJson(app, {
      method: 'PATCH',
      path: `/api/inquiries/${reply.id}/replies`,
      headers: authHeader(seller.id),
      body: {
        content: '수정된 답변',
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(reply.id);
    expect(res.body.content).toBe('수정된 답변');
  });
});
