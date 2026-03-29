import { prisma } from '../../../lib/constants/prismaClient';
import { OrderStatus, UserType } from '@prisma/client';
import express from 'express';
import { ordersRouter } from '../orders.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';
import { makeAccessToken } from '../../../lib/constants/token';

// ─── 테스트 앱 생성 ───
export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/orders', ordersRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

// ─── 인증 헤더 생성 (실제 토큰 사용) ───
export function createAuthHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}

// ─── 바이어 시드 ───
export async function seedBuyer(
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
    points: number;
    gradeId: string;
  }> = {},
) {
  return prisma.user.create({
    data: {
      id: overrides.id ?? 'test-buyer-id',
      type: UserType.BUYER,
      email: overrides.email ?? 'buyer@test.com',
      name: overrides.name ?? '테스트바이어',
      passwordHash: 'hashed-password',
      points: overrides.points ?? 10000,
      lifetimeSpend: 0,
      gradeId: overrides.gradeId ?? undefined,
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
  overrides: Partial<{ id: string; email: string; name: string }> = {},
) {
  return prisma.user.create({
    data: {
      id: overrides.id ?? 'test-seller-id',
      type: UserType.SELLER,
      email: overrides.email ?? 'seller@test.com',
      name: overrides.name ?? '테스트셀러',
      passwordHash: 'hashed-password',
    },
  });
}

// ─── 스토어 시드 ───
export async function seedStore(
  sellerId: string,
  overrides: Partial<{ id: string }> = {},
) {
  return prisma.store.create({
    data: {
      id: overrides.id ?? 'test-store-id',
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
export async function seedCategory(
  overrides: Partial<{ id: string; name: string }> = {},
) {
  return prisma.category.create({
    data: {
      id: overrides.id ?? 'test-category-id',
      name: overrides.name ?? '테스트카테고리',
    },
  });
}

// ─── 사이즈 시드 ───
export async function seedSize(
  overrides: Partial<{
    id: number;
    name: string;
    nameEn: string;
    nameKo: string;
  }> = {},
) {
  const id = overrides.id ?? 1;
  await prisma.size.deleteMany({ where: { id } });

  return prisma.size.create({
    data: {
      id,
      name: overrides.name ?? 'M',
      nameEn: overrides.nameEn ?? 'Medium',
      nameKo: overrides.nameKo ?? '중간',
    },
  });
}

// ─── 상품 시드 ───
export async function seedProduct(
  storeId: string,
  categoryId: string,
  overrides: Partial<{ id: string; name: string; price: number }> = {},
) {
  return prisma.product.create({
    data: {
      id: overrides.id ?? 'test-product-id',
      storeId,
      categoryId,
      name: overrides.name ?? '테스트상품',
      price: overrides.price ?? 10000,
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
    data: {
      productId,
      sizeId,
      quantity,
    },
  });
}

// ─── 등급 시드 ───
export async function seedGrade(
  overrides: Partial<{
    id: string;
    name: string;
    rate: number;
    minAmount: number;
  }> = {},
) {
  return prisma.grade.create({
    data: {
      id: overrides.id ?? 'grade-green',
      name: overrides.name ?? 'Green',
      rate: overrides.rate ?? 1,
      minAmount: overrides.minAmount ?? 0,
    },
  });
}

// ─── 장바구니 + 아이템 시드 ───
export async function seedCartWithItem(
  buyerId: string,
  productId: string,
  sizeId: number,
) {
  return prisma.cart.create({
    data: {
      buyerId,
      items: {
        create: {
          productId,
          sizeId,
          quantity: 1,
        },
      },
    },
    include: { items: true },
  });
}

// ─── 주문 시드 (결제 + 배송 포함) ───
export async function seedOrder(
  buyerId: string,
  overrides: Partial<{
    id: string;
    status: OrderStatus;
    usedPoints: number;
    earnedPoints: number;
  }> = {},
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
      usedPoints: overrides.usedPoints ?? 0,
      earnedPoints: overrides.earnedPoints ?? 0,
      items: {
        create: {
          productId: 'test-product-id',
          sizeId: 1,
          quantity: 2,
          unitPrice: 10000,
          productName: '테스트상품',
          productImageUrl: null,
        },
      },
      payment: {
        create: {
          price: 20000,
          status: 'WaitingPayment',
          paymentMethod: 'CREDIT_CARD',
        },
      },
      shipping: {
        create: {
          status: 'ReadyToShip',
          trackingNumber: String(Math.floor(Math.random() * 10000000000000)),
          carrier: '로켓배송',
        },
      },
    },
    include: {
      items: true,
      payment: true,
      shipping: true,
    },
  });
}

// ─── 배송중 주문 시드 ───
export async function seedShippingOrder(buyerId: string) {
  return prisma.order.create({
    data: {
      id: `shipping-order-${Date.now()}-${Math.random()}`,
      buyerId,
      buyerName: '테스트바이어',
      phoneNumber: '010-1111-2222',
      address: '서울시 강남구 테스트동',
      status: 'CompletedPayment',
      items: {
        create: {
          productId: 'test-product-id',
          sizeId: 1,
          quantity: 1,
          unitPrice: 10000,
          productName: '테스트상품',
        },
      },
      payment: {
        create: {
          price: 10000,
          status: 'CompletedPayment',
          paymentMethod: 'CREDIT_CARD',
        },
      },
      shipping: {
        create: {
          status: 'InShipping',
          trackingNumber: String(Math.floor(Math.random() * 10000000000000)),
          carrier: '로켓배송',
          inShippingAt: new Date(),
        },
      },
    },
    include: { items: true, payment: true, shipping: true },
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
