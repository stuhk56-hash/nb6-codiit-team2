import { prisma } from '../../lib/constants/prismaClient';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

const paymentSelect = {
  id: true,
  orderId: true,
  price: true,
  paymentMethod: true,
  status: true,
  cardNumber: true,
  bankName: true,
  phoneNumber: true,
  transactionId: true,
  createdAt: true,
  updatedAt: true,
  order: {
    select: {
      id: true,
      buyerId: true,
      buyerName: true,
      phoneNumber: true,
      address: true,
      status: true,
      usedPoints: true,
      earnedPoints: true,
      createdAt: true,
    },
  },
} as const;

// 주문 ID로 결제 조회
export async function findPaymentByOrderId(orderId: string) {
  return prisma.payment.findUnique({
    where: { orderId },
    select: paymentSelect,
  });
}

// 결제 ID로 결제 조회
export async function findPaymentById(paymentId: string) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    select: paymentSelect,
  });
}

// 사용자별 결제 목록 조회 (페이지네이션)
export async function findPaymentsByUserId(
  buyerId: string,
  limit: number,
  page: number,
  status?: string,
) {
  const skip = (page - 1) * limit;

  const where: {
    order: {
      buyerId: string;
    };
    status?: PaymentStatus;
  } = {
    order: {
      buyerId,
    },
  };

  if (status) {
    where.status = status as PaymentStatus;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      select: paymentSelect,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    total,
  };
}

// 상태별 결제 목록 조회
export async function findPaymentsByStatus(status: string) {
  return prisma.payment.findMany({
    where: { status: status as PaymentStatus },
    select: paymentSelect,
    orderBy: { createdAt: 'desc' },
  });
}

// 결제 생성
export async function createPayment(
  orderId: string,
  price: number, // ✅ 이 값이 이미 포인트 차감된 금액이어야 함
  paymentMethod: PaymentMethod,
  cardNumber?: string,
  bankName?: string,
  phoneNumber?: string,
) {
  // 주문 존재 확인
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('주문을 찾을 수 없습니다');
  }

  // 이미 결제된 주문인지 확인 (CompletedPayment 상태)
  const existingPayment = await prisma.payment.findUnique({
    where: { orderId },
  });

  if (
    existingPayment &&
    existingPayment.status === PaymentStatus.CompletedPayment
  ) {
    throw new Error('이미 결제된 주문입니다');
  }

  const transactionId = generateTransactionId();

  let payment;

  // 기존 Payment가 있으면 UPDATE, 없으면 CREATE
  if (existingPayment) {
    payment = await prisma.payment.update({
      where: { orderId },
      data: {
        price: price, // ✅ 포인트 차감된 가격
        paymentMethod,
        cardNumber:
          paymentMethod === PaymentMethod.CREDIT_CARD
            ? cardNumber?.slice(-4)
            : null,
        bankName:
          paymentMethod === PaymentMethod.BANK_TRANSFER ? bankName : null,
        phoneNumber:
          paymentMethod === PaymentMethod.MOBILE_PHONE ? phoneNumber : null,
        status: PaymentStatus.CompletedPayment,
        transactionId: transactionId,
      },
      select: paymentSelect,
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        orderId,
        price: price, // ✅ 포인트 차감된 가격
        paymentMethod,
        cardNumber:
          paymentMethod === PaymentMethod.CREDIT_CARD
            ? cardNumber?.slice(-4)
            : null,
        bankName:
          paymentMethod === PaymentMethod.BANK_TRANSFER ? bankName : null,
        phoneNumber:
          paymentMethod === PaymentMethod.MOBILE_PHONE ? phoneNumber : null,
        status: PaymentStatus.CompletedPayment,
        transactionId: transactionId,
      },
      select: paymentSelect,
    });
  }

  // 결제 성공 시 주문 상태 업데이트
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CompletedPayment' },
  });

  return payment;
}

// 결제 상태 업데이트
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status },
    select: paymentSelect,
  });
}

// 결제 취소 (트랜잭션)
export async function cancelPaymentWithTransaction(orderId: string) {
  return prisma.$transaction(async function (tx) {
    const payment = await tx.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new Error('결제 정보를 찾을 수 없습니다');
    }

    // 이미 결제 완료된 경우는 취소 불가
    if (payment.status === PaymentStatus.CompletedPayment) {
      throw new Error('이미 결제된 주문은 취소할 수 없습니다');
    }

    if (payment.status === PaymentStatus.CanceledPayment) {
      throw new Error('이미 취소된 결제입니다');
    }

    // 1. 결제 상태 취소로 변경
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.CanceledPayment },
      select: paymentSelect,
    });

    // 2. 주문 상태도 취소로 업데이트
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'Canceled' },
    });

    return updatedPayment;
  });
}

// 거래 ID 생성
function generateTransactionId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TXN-${timestamp}-${randomStr}`.toUpperCase();
}
