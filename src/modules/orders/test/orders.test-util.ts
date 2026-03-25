import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import { ordersRouter } from '../orders.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/orders', ordersRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export async function clearOrdersTestData() {
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.size.deleteMany();
  await prisma.storeFavorite.deleteMany();
  await prisma.store.deleteMany();
  await prisma.inquiryAnswer.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.user.deleteMany();
  await prisma.grade.deleteMany();
}

export async function seedGrade() {
  const unique = Date.now();
  return prisma.grade.create({
    data: {
      id: `grade_${unique}`,
      name: `grade_${unique}`,
      minAmount: 0,
      rate: 5,
    },
  });
}

export async function seedBuyer() {
  const unique = `${Date.now()}+${Math.random()}`;
  const grade = await seedGrade();
  return prisma.user.create({
    data: {
      type: 'BUYER',
      email: `buyer_${unique}@example.com`,
      name: `buyer_${unique}`,
      passwordHash: 'hashed-password',
      points: 10000,
      gradeId: grade.id,
    },
  });
}

export async function seedSeller() {
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

export async function seedSellerAndStore() {
  const unique = `${Date.now()}+${Math.random()}`;
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
      address: '서울시 용산구',
      detailAddress: '101호',
      phoneNumber: '010-1234-5678',
      content: '스토어 소개',
      imageUrl: 'https://example.com/store.jpg',
    },
  });

  return { seller, store };
}

export async function seedCategory(name: string) {
  return prisma.category.create({
    data: { name: `${name}_${Date.now()}` },
  });
}

export async function seedSize() {
  const unique = Date.now();
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
  name: string;
  price: number;
  content?: string;
  imageUrl?: string;
}) {
  return prisma.product.create({
    data: {
      storeId: input.storeId,
      categoryId: input.categoryId,
      name: input.name,
      price: input.price,
      content: input.content,
      imageUrl: input.imageUrl,
      stocks: {
        create: [{ sizeId: input.sizeId, quantity: 100 }],
      },
    },
  });
}

export async function seedOrder(input: {
  buyerId: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  usedPoints?: number;
  earnedPoints?: number;
}) {
  return prisma.order.create({
    data: {
      buyerId: input.buyerId,
      buyerName: input.buyerName,
      phoneNumber: input.phoneNumber,
      address: input.address,
      usedPoints: input.usedPoints || 0,
      earnedPoints: input.earnedPoints || 0,
      status: 'WaitingPayment',
    },
  });
}

export async function seedPayment(input: {
  orderId: string;
  price: number;
  status?: 'Pending' | 'CompletedPayment' | 'Failed' | 'Canceled';
}) {
  return prisma.payment.create({
    data: {
      orderId: input.orderId,
      price: input.price,
      status: input.status || 'CompletedPayment',
    },
  });
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}
