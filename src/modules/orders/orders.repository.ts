import { prisma } from '../../lib/constants/prismaClient';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';
import { notificationHub } from '../notifications/notification-hub';
import { toAlarmDto } from '../notifications/utils/notifications.mapper';

const orderSelect = {
  id: true,
  buyerId: true,
  buyerName: true,
  phoneNumber: true,
  address: true,
  usedPoints: true,
  earnedPoints: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      unitPrice: true,
      quantity: true,
      productId: true,
      productName: true,
      productImageUrl: true,
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          store: true,
          stocks: {
            select: {
              id: true,
              quantity: true,
              size: true,
            },
          },
          reviews: true,
        },
      },
      size: true,
      reviews: true,
    },
  },
  payment: {
    select: {
      id: true,
      price: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
      updatedAt: true,
      orderId: true,
    },
  },
  shipping: {
    select: {
      id: true,
      status: true,
      trackingNumber: true,
      carrier: true,
      readyToShipAt: true,
      inShippingAt: true,
      deliveredAt: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const;

export class OrderRepository {
  // ✅ 송장번호 생성 (추가된 부분)
  private generateTrackingNumber(): string {
    return String(Math.floor(Math.random() * 10000000000000));
  }

  // buyerId로 주문 목록 조회
  async findOrdersByUserId(
    buyerId: string,
    limit: number,
    page: number,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: {
      buyerId: string;
      payment?: {
        is: {
          status: PaymentStatus;
        };
      };
    } = {
      buyerId,
    };

    if (status) {
      where.payment = {
        is: {
          status: status as PaymentStatus,
        },
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: orderSelect,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
    };
  }

  async findOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: orderSelect,
    });
  }

  async createOrderWithTransaction(
    buyerId: string,
    data: {
      buyerName: string;
      phoneNumber: string;
      address: string;
      usedPoints: number;
    },
    processedItems: Array<{
      productId: string;
      sizeId: number;
      quantity: number;
      unitPrice: number;
      productName: string;
      productImageUrl: string | null;
    }>,
    totalPrice: number,
    usePoint: number,
  ) {
    const emittedNotifications: any[] = [];

    const orderId = await prisma.$transaction(async (tx) => {
      const pendingNotifications = new Map<
        string,
        { userId: string; content: string }
      >();
      const soldOutNotifiedProducts = new Set<string>();

      const queueNotification = (userId: string, content: string) => {
        const key = `${userId}:${content}`;
        pendingNotifications.set(key, { userId, content });
      };

      const createdOrder = await tx.order.create({
        data: {
          buyerId,
          buyerName: data.buyerName,
          phoneNumber: data.phoneNumber,
          address: data.address,
          usedPoints: data.usedPoints,
          earnedPoints: 0,
          status: 'WaitingPayment' as OrderStatus,
        },
      });

      for (const item of processedItems) {
        const updatedStock = await tx.productStock.update({
          where: {
            productId_sizeId: {
              productId: item.productId,
              sizeId: item.sizeId,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                store: {
                  select: {
                    sellerId: true,
                  },
                },
              },
            },
            size: {
              select: {
                name: true,
              },
            },
          },
        });

        if (updatedStock.quantity <= 0) {
          queueNotification(
            updatedStock.product.store.sellerId,
            `판매중인 상품 "${updatedStock.product.name}" (${updatedStock.size.name}) 사이즈가 품절되었습니다.`,
          );

          const cartOwners = await tx.cartItem.findMany({
            where: {
              productId: item.productId,
              sizeId: item.sizeId,
            },
            select: {
              cart: {
                select: {
                  buyerId: true,
                },
              },
            },
          });

          for (const owner of cartOwners) {
            queueNotification(
              owner.cart.buyerId,
              `장바구니/주문 상품 "${updatedStock.product.name}" (${updatedStock.size.name})이(가) 품절되었습니다.`,
            );
          }

          if (!soldOutNotifiedProducts.has(item.productId)) {
            const hasRemainingStock = await tx.productStock.findFirst({
              where: {
                productId: item.productId,
                quantity: {
                  gt: 0,
                },
              },
            });

            if (!hasRemainingStock) {
              queueNotification(
                updatedStock.product.store.sellerId,
                `판매중인 상품 "${updatedStock.product.name}"의 모든 사이즈가 품절되었습니다.`,
              );
              soldOutNotifiedProducts.add(item.productId);
            }
          }
        }
      }

      await Promise.all(
        processedItems.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productId: item.productId,
              sizeId: item.sizeId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              productName: item.productName,
              productImageUrl: item.productImageUrl,
            },
          }),
        ),
      );

      if (usePoint > 0) {
        await tx.user.update({
          where: { id: buyerId },
          data: {
            points: {
              decrement: usePoint,
            },
          },
        });
      }

      const finalPrice = totalPrice - usePoint;
      const user = await tx.user.findUnique({
        where: { id: buyerId },
        include: { grade: true },
      });

      const earnedPoints = Math.floor(
        finalPrice * ((user.grade?.rate ?? 0) / 100),
      );

      const newLifetimeSpend = (user.lifetimeSpend || 0) + finalPrice;

      await tx.order.update({
        where: { id: createdOrder.id },
        data: { earnedPoints },
      });

      await tx.user.update({
        where: { id: buyerId },
        data: {
          lifetimeSpend: newLifetimeSpend,
          points: { increment: earnedPoints },
        },
      });

      await tx.shipping.create({
        data: {
          orderId: createdOrder.id,
          status: 'ReadyToShip',
          trackingNumber: this.generateTrackingNumber(), // ✅ 여기 수정
          carrier: '로켓배송',
        },
      });

      const newGrade = await tx.grade.findFirst({
        where: {
          minAmount: { lte: newLifetimeSpend },
        },
        orderBy: { minAmount: 'desc' },
      });

      if (newGrade && newGrade.id !== user.gradeId) {
        await tx.user.update({
          where: { id: buyerId },
          data: { gradeId: newGrade.id },
        });
      }

      if (pendingNotifications.size > 0) {
        const createdNotifications = await Promise.all(
          Array.from(pendingNotifications.values()).map((n) =>
            tx.notification.create({ data: n }),
          ),
        );
        emittedNotifications.push(...createdNotifications);
      }

      return createdOrder.id;
    });

    for (const notification of emittedNotifications) {
      notificationHub.emit(notification.userId, toAlarmDto(notification));
    }

    return this.findOrderById(orderId);
  }

  async cancelOrderWithTransaction(buyerId: string, orderId: string) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) throw new Error('주문을 찾을 수 없습니다');

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'Canceled' as OrderStatus },
      });

      const totalPointsToRestore = order.usedPoints + order.earnedPoints;

      if (totalPointsToRestore > 0) {
        await tx.user.update({
          where: { id: buyerId },
          data: {
            points: { increment: totalPointsToRestore },
          },
        });
      }
    });
  }

  async updateOrder(orderId: string, data: any) {
    return prisma.order.update({
      where: { id: orderId },
      data,
      select: orderSelect,
    });
  }

  async checkProductStock(productId: string, sizeId: number) {
    return prisma.productStock.findUnique({
      where: {
        productId_sizeId: {
          productId,
          sizeId,
        },
      },
      select: {
        id: true,
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
          },
        },
      },
    });
  }
}

export const orderRepository = new OrderRepository();
