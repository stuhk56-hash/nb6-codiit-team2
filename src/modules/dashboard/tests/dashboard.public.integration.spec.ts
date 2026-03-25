import { prisma } from '../../../lib/constants/prismaClient';
import {
  clearDashboardTestData,
  createDashboardTestApp,
  requestJson,
} from './dashboard.test-util';

describe('dashboard.public.integration', () => {
  const app = createDashboardTestApp();

  beforeEach(async () => {
    await clearDashboardTestData();
  });

  afterAll(async () => {
    await clearDashboardTestData();
    await prisma.$disconnect();
  });

  test('GET /api/dashboard - 비로그인 요청은 401을 반환한다', async () => {
    const res = await requestJson(app, {
      method: 'GET',
      path: '/api/dashboard',
    });

    expect(res.status).toBe(401);
  });
});
