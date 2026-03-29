import { prisma } from '../../../lib/constants/prismaClient';
import {
  UserType,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from '@prisma/client';
import express from 'express';
import { paymentsRouter } from '../payment.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';
import { makeAccessToken } from '../../../lib/constants/token';

// ─── 테스트 앱 생성 ───
export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/payments', paymentsRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

// ─── 인증 헤더 생성 ───
export function createAuthHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}

// ─── 바이어 시드 ───
export async function seedBuyer(
  overrides: Partial<{ id: string; email: string; name: string }> = {},
) {
  return prisma.user.create({
    data: {
      id: overrides.id ?? 'test-buyer-id',
      type: UserType.BUYER,
      email: overrides.email ?? 'buyer@test.com',
      name: overrides.name ?? '테스트바이어',
      passwordHash: 'hashed-password',
      points: 10000,
      lifetimeSpend: 0,
    },
  });
}

// ─── 다른 바이어 시드 ───
export async function seedOtherBuyer(
  overrides: Partial<{ id: string; email: string; name: string }> = {},
) {
  return prisma.user.create({
    data: {
      id: overrides.id ?? 'other-buyer-id',
      type: UserType.BUYER,
      email: overrides.email ?? 'other-buyer@test.com',
      name: overrides.name ?? '다른바이어',
      passwordHash: 'hashed-password',
      points: 5000,
      lifetimeSpend: 0,
    },
  });
}

// ─── 셀러 시드 ───
export async function seedSeller(
  overrides: Partial<{ id: string; email: string }> = {},
) {
  return prisma.user.create({
    data: {
      id: overrides.id ?? 'test-seller-id',
      type: UserType.SELLER,
      email: overrides.email ?? 'seller@test.com',
      name: '테스트셀러',
      passwordHash: 'hashed-password',
    },
  });
}

// ─── 스토어 시드 ───
export async function seedStore(sellerId: string) {
  return prisma.store.create({
    data: {
      id: 'test-store-id',
      sellerId,
      name: '테스트스토어',
      address: '서울시 강남구',
      detailAddress: '1층',
      phoneNumber: '010-1234-5678',
      content: '테스트 스토어입니다',
    },
  });
}

// ─── 카테고리 시드 ───
export async function seedCategory() {
  return prisma.category.create({
    data: { id: 'test-category-id', name: '테스트카테고리' },
  });
}

// ─── 사이즈 시드 ───
export async function seedSize() {
  await prisma.size.deleteMany({ where: { id: 1 } });
  return prisma.size.create({
    data: { id: 1, name: 'M', nameEn: 'Medium', nameKo: '중간' },
  });
}

// ─── 상품 시드 ───
export async function seedProduct(storeId: string, categoryId: string) {
  return prisma.product.create({
    data: {
      id: 'test-product-id',
      storeId,
      categoryId,
      name: '테스트상품',
      price: 10000,
    },
  });
}

// ─── 재고 시드 ───
export async function seedProductStock(
  productId: string,
  sizeId: number,
  quantity: number = 100,
) {
  return prisma.productStock.create({
    data: { productId, sizeId, quantity },
  });
}

// ─── 주문 시드 (결제 없이) ───
export async function seedOrderWithoutPayment(
  buyerId: string,
  overrides: Partial<{ id: string; status: OrderStatus }> = {},
) {
  const orderId = overrides.id ?? `order-${Date.now()}-${Math.random()}`;
  return prisma.order.create({
    data: {
      id: orderId,
      buyerId,
      buyerName: '테스트바이어',
      phoneNumber: '010-1111-2222',
      address: '서울시 강남구 테스트동',
      status: overrides.status ?? 'WaitingPayment',
      items: {
        create: {
          productId: 'test-product-id',
          sizeId: 1,
          quantity: 2,
          unitPrice: 10000,
          productName: '테스트상품',
        },
      },
    },
    include: { items: true },
  });
}

// ─── 주문 + 결제 시드 ───
export async function seedOrderWithPayment(
  buyerId: string,
  overrides: Partial<{
    orderId: string;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    orderStatus: OrderStatus;
  }> = {},
) {
  const orderId = overrides.orderId ?? `order-${Date.now()}-${Math.random()}`;
  return prisma.order.create({
    data: {
      id: orderId,
      buyerId,
      buyerName: '테스트바이어',
      phoneNumber: '010-1111-2222',
      address: '서울시 강남구 테스트동',
      status: overrides.orderStatus ?? 'WaitingPayment',
      items: {
        create: {
          productId: 'test-product-id',
          sizeId: 1,
          quantity: 2,
          unitPrice: 10000,
          productName: '테스트상품',
        },
      },
      payment: {
        create: {
          price: 20000,
          status: overrides.paymentStatus ?? 'WaitingPayment',
          paymentMethod: overrides.paymentMethod ?? 'CREDIT_CARD',
          transactionId:
            `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase(),
        },
      },
    },
    include: { items: true, payment: true },
  });
}

// ─── 전체 데이터 정리 ───
export async function cleanupDatabase() {
  await prisma.notification.deleteMany();
  await prisma.shippingHistory.deleteMany();
  await prisma.shipping.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.productSizeSpec.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storeFavorite.deleteMany();
  await prisma.storeAuditLog.deleteMany();
  await prisma.store.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.size.deleteMany();
  await prisma.grade.deleteMany();
}
