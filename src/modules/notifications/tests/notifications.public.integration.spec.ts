import { prisma } from '../../../lib/constants/prismaClient';
import {
  clearNotificationsTestData,
  createNotificationsTestApp,
  requestJson,
} from './notifications.test-util';

describe('notifications.public.integration', () => {
  const app = createNotificationsTestApp();

  beforeEach(async () => {
    await clearNotificationsTestData();
  });

  afterAll(async () => {
    await clearNotificationsTestData();
    await prisma.$disconnect();
  });

  test('GET /api/notifications - 비로그인 요청은 401을 반환한다', async () => {
    const res = await requestJson(app, {
      method: 'GET',
      path: '/api/notifications',
    });

    expect(res.status).toBe(401);
  });
});
