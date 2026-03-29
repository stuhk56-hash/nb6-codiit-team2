import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';
import { s3Router } from '../s3.module';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/s3', s3Router);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export async function clearS3TestData() {
  await prisma.inquiryAnswer.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeFavorite.deleteMany();
  await prisma.store.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
}

export async function createUser(type: 'SELLER' | 'BUYER' = 'SELLER') {
  const unique = `${Date.now()}_${Math.random()}`;
  return prisma.user.create({
    data: {
      type,
      email: `s3_${type.toLowerCase()}_${unique}@example.com`,
      name: `s3_${type.toLowerCase()}_${unique}`,
      passwordHash: 'hashed-password',
    },
  });
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}
