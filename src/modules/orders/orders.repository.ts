import { prisma } from '../../lib/constants/prismaClient';
import { PaymentStatus, OrderStatus } from '@prisma/client';

const orderSelect = {
  id: true,
  buyerId: true,
  buyerName: true,
  phoneNumber: true,
  address: true,
  usedPoints: true,
  earnedPoints: true,
  createdAt: true,
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
      createdAt: true,
      updatedAt: true,
      orderId: true,
    },
  },
} as const;

// buyerId로 주문 목록 조회 (페이지네이션)
export async function findOrdersByUserId(
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

//orderId로 주문 조회
export async function findOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: orderSelect,
  });
}

//주문 생성 (트랜잭션)
export async function createOrderWithTransaction(
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
  const orderId = await prisma.$transaction(async (tx) => {
    // 1. 주문 생성
    const createdOrder = await tx.order.create({
      data: {
        buyerId,
        buyerName: data.buyerName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        usedPoints: data.usedPoints,
        status: 'WaitingPayment' as OrderStatus,
      },
    });

    // 2. 재고 재검증 및 감소
    for (const item of processedItems) {
      const currentStock = await tx.productStock.findUnique({
        where: {
          productId_sizeId: {
            productId: item.productId,
            sizeId: item.sizeId,
          },
        },
      });

      if (!currentStock || currentStock.quantity < item.quantity) {
        throw new Error('재고가 부족합니다. 주문이 취소되었습니다.');
      }

      await tx.productStock.update({
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
      });
    }

    // 3. 주문 아이템 생성
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

    // 4. 포인트 차감
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

    //5. 적립 포인트 계산, lifetimeSpend 업데이트
    const finalPrice = totalPrice - usePoint;
    const userGrade = await tx.grade.findFirst({
      where: {
        users: {
          some: { id: buyerId },
        },
      },
    });

    //현재 등급 적립률로 포인트 계산
    const earnedPoints = Math.floor(
      finalPrice * ((userGrade?.rate ?? 0) / 100),
    );

    //사용자 정보 조회
    const user = await tx.user.findUnique({
      where: { id: buyerId },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 5. 결제 생성

    return createdOrder.id;
  });

  return findOrderById(orderId);
}

//주문 정보 수정
export async function updateOrder(
  orderId: string,
  data: {
    buyerName?: string;
    phoneNumber?: string;
    address?: string;
  },
) {
  return prisma.order.update({
    where: { id: orderId },
    data,
    select: orderSelect,
  });
}

//주문 취소 (트랜잭션)
export async function cancelOrderWithTransaction(
  buyerId: string,
  orderId: string,
  usedPoints: number,
) {
  await prisma.$transaction(async (tx) => {
    // 1. 주문 상태 취소로 변경
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'Canceled' as OrderStatus },
    });

    // 2. 포인트 복구
    if (usedPoints > 0) {
      await tx.user.update({
        where: { id: buyerId },
        data: {
          points: {
            increment: usedPoints,
          },
        },
      });
    }
  });
}

//상품 재고 확인
export async function checkProductStock(productId: string, sizeId: number) {
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
