import http from 'http';
import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';
import { dashboardRouter } from '../dashboard.module';

export function createDashboardTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/dashboard', dashboardRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}

export async function requestJson(
  app: ReturnType<typeof createDashboardTestApp>,
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

export async function clearDashboardTestData() {
  await prisma.inquiryAnswer.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeFavorite.deleteMany();
  await prisma.store.deleteMany();
  await prisma.category.deleteMany();
  await prisma.size.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedSellerAndStore() {
  const unique = `${Date.now()}_${Math.random()}`;
  const seller = await prisma.user.create({
    data: {
      type: 'SELLER',
      email: `dashboard_seller_${unique}@example.com`,
      name: `dashboard-seller-${unique}`,
      passwordHash: 'hashed-password',
    },
  });

  const store = await prisma.store.create({
    data: {
      sellerId: seller.id,
      name: '대시보드 테스트 스토어',
      address: '서울시 강남구',
      detailAddress: '101호',
      phoneNumber: '010-2222-4444',
      content: '스토어 소개',
    },
  });

  return { seller, store };
}

export async function seedBuyer() {
  const unique = `${Date.now()}_${Math.random()}`;
  return prisma.user.create({
    data: {
      type: 'BUYER',
      email: `dashboard_buyer_${unique}@example.com`,
      name: `dashboard-buyer-${unique}`,
      passwordHash: 'hashed-password',
    },
  });
}

export async function seedCategory(name = 'top') {
  const unique = `${Date.now()}_${Math.random()}`;
  return prisma.category.create({
    data: {
      name: `${name}_${unique}`,
    },
  });
}

export async function seedSize() {
  const unique = `${Date.now()}_${Math.random()}`;
  return prisma.size.create({
    data: {
      name: `M_${unique}`,
      nameEn: `M_${unique}`,
      nameKo: `미디움_${unique}`,
    },
  });
}

export async function seedProduct(input: {
  storeId: string;
  categoryId: string;
  sizeId: number;
  name?: string;
  price?: number;
}) {
  return prisma.product.create({
    data: {
      storeId: input.storeId,
      categoryId: input.categoryId,
      name: input.name ?? '대시보드 상품',
      price: input.price ?? 30000,
      stocks: {
        create: [{ sizeId: input.sizeId, quantity: 10 }],
      },
    },
  });
}

export async function seedCompletedSale(input: {
  buyerId: string;
  productId: string;
  sizeId: number;
  unitPrice?: number;
  quantity?: number;
  productName?: string;
  createdAt?: Date;
}) {
  const order = await prisma.order.create({
    data: {
      buyerId: input.buyerId,
      status: 'CompletedPayment',
      buyerName: '대시보드 구매자',
      phoneNumber: '010-0000-1111',
      address: '서울시 송파구',
      createdAt: input.createdAt,
      items: {
        create: [
          {
            productId: input.productId,
            sizeId: input.sizeId,
            quantity: input.quantity ?? 2,
            unitPrice: input.unitPrice ?? 30000,
            productName: input.productName ?? '대시보드 상품',
          },
        ],
      },
      payment: {
        create: {
          price: (input.unitPrice ?? 30000) * (input.quantity ?? 2),
          status: 'Paid',
        },
      },
    },
  });

  return order;
}
