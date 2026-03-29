import http from 'http';
import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import { productReviewsRouter, reviewsRouter } from '../reviews.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';

export function createReviewTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/review', reviewsRouter);
  app.use('/api/product', productReviewsRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}

export async function requestJson(
  app: ReturnType<typeof createReviewTestApp>,
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

export async function clearReviewTestData() {
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
      email: `review_seller_${unique}@example.com`,
      name: `review-seller-${unique}`,
      passwordHash: 'hashed-password',
    },
  });

  const store = await prisma.store.create({
    data: {
      sellerId: seller.id,
      name: '리뷰 테스트 스토어',
      address: '서울시 강남구',
      detailAddress: '101호',
      phoneNumber: '010-1234-5678',
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
      email: `review_buyer_${unique}@example.com`,
      name: `review-buyer-${unique}`,
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
      name: input.name ?? '리뷰 테스트 상품',
      price: input.price ?? 12000,
      stocks: {
        create: [{ sizeId: input.sizeId, quantity: 10 }],
      },
    },
  });
}

export async function seedCompletedOrderItem(input: {
  buyerId: string;
  productId: string;
  sizeId: number;
  productName?: string;
  unitPrice?: number;
  quantity?: number;
}) {
  const createdOrder = await prisma.order.create({
    data: {
      buyerId: input.buyerId,
      status: 'CompletedPayment',
      buyerName: '리뷰 구매자',
      phoneNumber: '010-0000-0000',
      address: '서울시 서초구',
      items: {
        create: [
          {
            productId: input.productId,
            sizeId: input.sizeId,
            quantity: input.quantity ?? 1,
            unitPrice: input.unitPrice ?? 12000,
            productName: input.productName ?? '리뷰 테스트 상품',
          },
        ],
      },
      payment: {
        create: {
          price: (input.unitPrice ?? 12000) * (input.quantity ?? 1),
          status: 'CompletedPayment',
          paymentMethod: 'CREDIT_CARD',
        },
      },
    },
  });

  const order = await prisma.order.findUnique({
    where: { id: createdOrder.id },
    include: {
      items: true,
      payment: true,
    },
  });

  if (!order || order.items.length === 0) {
    throw new Error('Failed to seed completed order item');
  }

  return {
    order,
    orderItem: order.items[0],
  };
}

export async function seedReview(input: {
  buyerId: string;
  productId: string;
  orderItemId: string;
  rating?: number;
  content?: string;
}) {
  return prisma.review.create({
    data: {
      buyerId: input.buyerId,
      productId: input.productId,
      orderItemId: input.orderItemId,
      rating: input.rating ?? 5,
      content: input.content ?? '좋은 상품입니다.',
    },
  });
}
