import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import { storesRouter } from '../stores.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/stores', storesRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export async function clearStoreTestData() {
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

export async function createSeller() {
  const unique = `${Date.now()}_${Math.random()}`;
  return prisma.user.create({
    data: {
      type: 'SELLER',
      email: `seller_${unique}@example.com`,
      name: `seller_${unique}`,
      passwordHash: 'hashed-password',
    },
  });
}

export async function createBuyer() {
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

export async function createStore(sellerId: string, name = '테스트 스토어') {
  return prisma.store.create({
    data: {
      sellerId,
      name,
      address: '서울시 강남구',
      detailAddress: '101호',
      phoneNumber: '010-1234-5678',
      content: '스토어 소개',
    },
  });
}

export async function createSize() {
  return prisma.size.create({
    data: {
      name: 'M',
      nameEn: 'M',
      nameKo: '미디움',
    },
  });
}

export async function createCategory(name = 'top') {
  return prisma.category.create({
    data: { name },
  });
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}
