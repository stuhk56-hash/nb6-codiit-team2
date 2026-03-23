import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import { cartRouter } from '../cart.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/cart', cartRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export async function clearCartTestData() {
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.size.deleteMany();
  await prisma.store.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedBuyer() {
  const unique = `${Date.now()}+${Math.random()}`;
  return prisma.user.create({
    data: {
      type: 'BUYER',
      email: `buyer_${unique}@example.com`,
      name: `buyer_${unique}`,
      passwordHash: 'hashed-password',
      points: 10000,
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

export async function seedCart(buyerId: string) {
  return prisma.cart.create({
    data: { buyerId },
  });
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}
