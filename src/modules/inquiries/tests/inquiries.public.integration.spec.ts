import { prisma } from '../../../lib/constants/prismaClient';
import {
  clearInquiryTestData,
  createInquiryTestApp,
  requestJson,
} from './inquiries.test-util';

describe('inquiries.public.integration', () => {
  const app = createInquiryTestApp();

  beforeEach(async () => {
    await clearInquiryTestData();
  });

  afterAll(async () => {
    await clearInquiryTestData();
    await prisma.$disconnect();
  });

  test('GET /api/inquiries - 비로그인 요청은 401을 반환한다', async () => {
    const res = await requestJson(app, {
      method: 'GET',
      path: '/api/inquiries',
    });

    expect(res.status).toBe(401);
  });
});
