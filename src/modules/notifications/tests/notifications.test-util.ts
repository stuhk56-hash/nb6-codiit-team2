import http from 'http';
import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';
import { notificationsRouter } from '../notifications.module';

export function createNotificationsTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/notifications', notificationsRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}

export async function requestJson(
  app: ReturnType<typeof createNotificationsTestApp>,
  input: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    headers?: Record<string, string>;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
  },
) {
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const search = new URLSearchParams();

  if (input.query) {
    for (const [key, value] of Object.entries(input.query)) {
      if (value !== undefined) {
        search.set(key, String(value));
      }
    }
  }

  const requestPath = search.size > 0
    ? `${input.path}?${search.toString()}`
    : input.path;

  return new Promise<{
    status: number;
    body: any;
    headers: http.IncomingHttpHeaders;
  }>((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: requestPath,
        method: input.method,
        headers: {
          'Content-Type': 'application/json',
          ...(input.headers ?? {}),
        },
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          server.close(() => {
            resolve({
              status: res.statusCode ?? 0,
              body: data ? JSON.parse(data) : undefined,
              headers: res.headers,
            });
          });
        });
      },
    );

    req.on('error', (error) => {
      server.close(() => reject(error));
    });

    if (input.body !== undefined) {
      req.write(JSON.stringify(input.body));
    }

    req.end();
  });
}

export async function clearNotificationsTestData() {
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.inquiryAnswer.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeFavorite.deleteMany();
  await prisma.store.deleteMany();
  await prisma.category.deleteMany();
  await prisma.size.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedBuyer() {
  const unique = `${Date.now()}_${Math.random()}`;
  return prisma.user.create({
    data: {
      type: 'BUYER',
      email: `notification_buyer_${unique}@example.com`,
      name: `notification-buyer-${unique}`,
      passwordHash: 'hashed-password',
    },
  });
}

export async function seedNotification(input: {
  userId: string;
  content?: string;
  isChecked?: boolean;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      content: input.content ?? '알림 내용입니다.',
      isChecked: input.isChecked ?? false,
    },
  });
}
