import http from 'http';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  authHeader,
  clearNotificationsTestData,
  createNotificationsTestApp,
  requestJson,
  seedBuyer,
  seedNotification,
} from './notifications.test-util';

describe('notifications.auth.integration', () => {
  const app = createNotificationsTestApp();

  beforeEach(async () => {
    await clearNotificationsTestData();
  });

  afterAll(async () => {
    await clearNotificationsTestData();
    await prisma.$disconnect();
  });

  test('GET /api/notifications - 페이지네이션 조회 성공', async () => {
    const user = await seedBuyer();
    await seedNotification({
      userId: user.id,
      content: '첫 번째 알림',
      isChecked: false,
    });
    await seedNotification({
      userId: user.id,
      content: '두 번째 알림',
      isChecked: true,
    });

    const res = await requestJson(app, {
      method: 'GET',
      path: '/api/notifications',
      headers: authHeader(user.id),
      query: { page: 1, pageSize: 10, sort: 'recent', filter: 'all' },
    });

    expect(res.status).toBe(200);
    expect(res.body.totalCount).toBe(2);
    expect(res.body.list).toHaveLength(2);
  });

  test('GET /api/notifications/sse - SSE 연결 성공', async () => {
    const user = await seedBuyer();
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    await new Promise<void>((resolve, reject) => {
      const req = http.get(
        {
          host: '127.0.0.1',
          port,
          path: '/api/notifications/sse',
          headers: authHeader(user.id),
        },
        (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toContain('text/event-stream');

          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            expect(chunk).toContain('data:');
            req.destroy();
            server.close(() => resolve());
          });
        },
      );

      req.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'ECONNRESET') {
          return;
        }

        server.close(() => reject(error));
      });
    });
  });

  test('PATCH /api/notifications/:alarmId/check - 읽음 처리 성공', async () => {
    const user = await seedBuyer();
    const notification = await seedNotification({
      userId: user.id,
      content: '읽지 않은 알림',
      isChecked: false,
    });

    const res = await requestJson(app, {
      method: 'PATCH',
      path: `/api/notifications/${notification.id}/check`,
      headers: authHeader(user.id),
    });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(notification.id);
    expect(res.body.isChecked).toBe(true);
  });
});
