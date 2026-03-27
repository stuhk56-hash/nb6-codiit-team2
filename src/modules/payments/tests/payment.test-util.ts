import express from 'express';
import { makeAccessToken } from '../../../lib/constants/token';
import { prisma } from '../../../lib/constants/prismaClient';
import { paymentsRouter } from '../payment.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';
import { PaymentStatus } from '@prisma/client';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/payments', paymentsRouter);
  app.use(defaultNotFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

export async function clearPaymentTestData() {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
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

export async function seedOrder(buyerId: string) {
  const unique = `${Date.now()}_${Math.random()}`;
  return prisma.order.create({
    data: {
      buyerId,
      buyerName: `buyer_${unique}`,
      phoneNumber: '010-1234-5678',
      address: '서울시 강남구',
      status: 'WaitingPayment',
      usedPoints: 5000,
      earnedPoints: 5000,
    },
  });
}

export async function seedPayment(input: {
  orderId: string;
  price: number;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'MOBILE_PHONE';
  cardNumber?: string;
  bankName?: string;
  phoneNumber?: string;
  status?: PaymentStatus;
}) {
  return prisma.payment.create({
    data: {
      orderId: input.orderId,
      price: input.price,
      paymentMethod: input.paymentMethod,
      cardNumber: input.cardNumber || null,
      bankName: input.bankName || null,
      phoneNumber: input.phoneNumber || null,
      status: input.status || PaymentStatus.WaitingPayment,
      transactionId:
        `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase(),
    },
  });
}

export function authHeader(userId: string) {
  const token = makeAccessToken(userId);
  return { Authorization: `Bearer ${token}` };
}
