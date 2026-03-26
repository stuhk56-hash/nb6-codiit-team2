import { PaymentStatus } from '@prisma/client';
import { prisma } from '../../lib/constants/prismaClient';
import type { DashboardSalesRecord } from './types/dashboard.type';

export class DashboardRepository {
  findStoreBySellerId(sellerId: string) {
    return prisma.store.findUnique({
      where: {
        sellerId,
      },
      select: {
        id: true,
      },
    });
  }

  async findSalesRecordsBySellerId(
    sellerId: string,
  ): Promise<DashboardSalesRecord[]> {
    const items = await prisma.orderItem.findMany({
      where: {
        product: {
          store: {
            sellerId,
          },
        },
        order: {
          status: 'CompletedPayment',
          payment: {
            is: {
              status: PaymentStatus.Paid,
            },
          },
        },
      },
      select: {
        quantity: true,
        unitPrice: true,
        order: {
          select: {
            createdAt: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    return items.map((item) => ({
      createdAt: item.order.createdAt,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      product: item.product,
    }));
  }
}

export const dashboardRepository = new DashboardRepository();
