import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import { productsRouter } from '../products.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/products', productsRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export async function clearProductTestData() {
  await prisma.inquiryAnswer.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeFavorite.deleteMany();
  await prisma.store.deleteMany();
  await prisma.category.deleteMany();
  await prisma.size.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedSellerAndStore() {
  const unique = `${Date.now()}_${Math.random()}`;
  const seller = await prisma.user.create({
    data: {
      type: 'SELLER',
      email: `seller_${unique}@example.com`,
      name: `seller_${unique}`,
      passwordHash: 'hashed-password',
    },
  });

  const store = await prisma.store.create({
    data: {
      sellerId: seller.id,
      name: '테스트 스토어',
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
      email: `buyer_${unique}@example.com`,
      name: `buyer_${unique}`,
      passwordHash: 'hashed-password',
    },
  });
}

export async function seedCategory(name: string) {
  return prisma.category.create({
    data: { name },
  });
}

export async function seedSize() {
  return prisma.size.create({
    data: {
      name: 'M',
      nameEn: 'M',
      nameKo: '미디움',
    },
  });
}

export async function seedProduct(input: {
  storeId: string;
  categoryId: string;
  sizeId: number;
  name: string;
  price: number;
  content?: string;
}) {
  return prisma.product.create({
    data: {
      storeId: input.storeId,
      categoryId: input.categoryId,
      name: input.name,
      price: input.price,
      content: input.content,
      stocks: {
        create: [{ sizeId: input.sizeId, quantity: 10 }],
      },
    },
  });
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}
