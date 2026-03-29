import http from 'http';
import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import { inquiriesRouter } from '../inquiries.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';

export function createInquiryTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/inquiries', inquiriesRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}

export async function requestJson(
  app: ReturnType<typeof createInquiryTestApp>,
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

export async function clearInquiryTestData() {
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
      email: `inquiry_seller_${unique}@example.com`,
      name: `inquiry-seller-${unique}`,
      passwordHash: 'hashed-password',
    },
  });

  const store = await prisma.store.create({
    data: {
      sellerId: seller.id,
      name: '문의 테스트 스토어',
      address: '서울시 강남구',
      detailAddress: '101호',
      phoneNumber: '010-2222-3333',
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
      email: `inquiry_buyer_${unique}@example.com`,
      name: `inquiry-buyer-${unique}`,
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
}) {
  return prisma.product.create({
    data: {
      storeId: input.storeId,
      categoryId: input.categoryId,
      name: input.name ?? '문의 테스트 상품',
      price: 15000,
      stocks: {
        create: [{ sizeId: input.sizeId, quantity: 10 }],
      },
    },
  });
}

export async function seedInquiry(input: {
  productId: string;
  buyerId: string;
  title?: string;
  content?: string;
  isSecret?: boolean;
  status?: 'WaitingAnswer' | 'CompletedAnswer';
}) {
  return prisma.inquiry.create({
    data: {
      productId: input.productId,
      buyerId: input.buyerId,
      title: input.title ?? '상품 문의',
      content: input.content ?? '문의 내용입니다.',
      isSecret: input.isSecret ?? false,
      status: input.status ?? 'WaitingAnswer',
    },
  });
}

export async function seedInquiryReply(input: {
  inquiryId: string;
  sellerId: string;
  content?: string;
}) {
  await prisma.inquiry.update({
    where: { id: input.inquiryId },
    data: {
      status: 'CompletedAnswer',
    },
  });

  return prisma.inquiryAnswer.create({
    data: {
      inquiryId: input.inquiryId,
      sellerId: input.sellerId,
      content: input.content ?? '답변 내용입니다.',
    },
  });
}
