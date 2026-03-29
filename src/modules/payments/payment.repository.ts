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

export class PaymentRepository {
  findPaymentByOrderId(orderId: string) {
    return prisma.payment.findUnique({
      where: { orderId },
      select: paymentSelect,
    });
  }

  findPaymentById(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      select: paymentSelect,
    });
  }

  async findPaymentsByUserId(
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

  findPaymentsByStatus(status: string) {
    return prisma.payment.findMany({
      where: { status: status as PaymentStatus },
      select: paymentSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPayment(
    orderId: string,
    price: number,
    paymentMethod: PaymentMethod,
    cardNumber?: string,
    bankName?: string,
    phoneNumber?: string,
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('주문을 찾을 수 없습니다');
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (
      existingPayment &&
      existingPayment.status === PaymentStatus.CompletedPayment
    ) {
      throw new Error('이미 결제된 주문입니다');
    }

    const transactionId = this.generateTransactionId();

    let payment;

    if (existingPayment) {
      payment = await prisma.payment.update({
        where: { orderId },
        data: {
          price: price,
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
          price: price,
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

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CompletedPayment' },
    });

    return payment;
  }

  updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { status },
      select: paymentSelect,
    });
  }

  async cancelPaymentWithTransaction(orderId: string) {
    return prisma.$transaction(async function (tx) {
      const payment = await tx.payment.findUnique({
        where: { orderId },
      });

      if (!payment) {
        throw new Error('결제 정보를 찾을 수 없습니다');
      }

      if (payment.status === PaymentStatus.CompletedPayment) {
        throw new Error('이미 결제된 주문은 취소할 수 없습니다');
      }

      if (payment.status === PaymentStatus.CanceledPayment) {
        throw new Error('이미 취소된 결제입니다');
      }

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.CanceledPayment },
        select: paymentSelect,
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'Canceled' },
      });

      return updatedPayment;
    });
  }

  private generateTransactionId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `TXN-${timestamp}-${randomStr}`.toUpperCase();
  }
}

export const paymentRepository = new PaymentRepository();
