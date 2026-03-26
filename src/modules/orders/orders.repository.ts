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
      paymentMethod: true, //
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
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: orderSelect,
  });

  return order;
}

// ✅ 주문 생성 (트랜잭션) - 결제 생성은 제거!
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
        earnedPoints: 0, // ✅ 초기값 0으로 설정 (나중에 업데이트)
        status: 'WaitingPayment' as OrderStatus, // ✅ 결제 대기 상태!
      },
    });

    // 2. 재고 재검증 및 감소
    for (const item of processedItems) {
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

    // 5. 현재 등급으로 포인트 적립 및 lifetimeSpend 업데이트
    const finalPrice = totalPrice - usePoint;
    const user = await tx.user.findUnique({
      where: { id: buyerId },
      include: {
        grade: true,
      },
    });

    const earnedPoints = Math.floor(
      finalPrice * ((user.grade?.rate ?? 0) / 100),
    );

    const newLifetimeSpend = (user.lifetimeSpend || 0) + finalPrice;

    // ✅ 적립 포인트를 주문에 저장
    await tx.order.update({
      where: { id: createdOrder.id },
      data: {
        earnedPoints: earnedPoints, // ✅ earnedPoints 저장!
      },
    });

    await tx.user.update({
      where: { id: buyerId },
      data: {
        lifetimeSpend: newLifetimeSpend,
        points: {
          increment: earnedPoints,
        },
      },
    });

    const shipping = await tx.shipping.create({
      data: {
        orderId: createdOrder.id,
        status: 'ReadyToShip',
        trackingNumber: generateTrackingNumber(),
        carrier: '로켓배송',
      },
    });

    // 6. 새로운 등급 찾기 및 업데이트
    const newGrade = await tx.grade.findFirst({
      where: {
        minAmount: {
          lte: newLifetimeSpend,
        },
      },
      orderBy: {
        minAmount: 'desc',
      },
    });

    if (newGrade && newGrade.id !== user.gradeId) {
      await tx.user.update({
        where: { id: buyerId },
        data: {
          gradeId: newGrade.id,
        },
      });
    }

    // ❌ 결제 생성 제거! (결제는 별도로 진행)

    return createdOrder.id;
  });

  return findOrderById(orderId);
}

// ✅ 주문 취소 (트랜잭션) - earnedPoints 복구 추가
export async function cancelOrderWithTransaction(
  buyerId: string,
  orderId: string,
) {
  await prisma.$transaction(async (tx) => {
    // 1. 취소할 주문 조회
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('주문을 찾을 수 없습니다');
    }

    // 2. 주문 상태 취소로 변경
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'Canceled' as OrderStatus },
    });

    // 3. 포인트 복구 (사용 포인트 + 적립 포인트) ✅ order에서 직접 가져오기
    const totalPointsToRestore = order.usedPoints + order.earnedPoints;

    if (totalPointsToRestore > 0) {
      await tx.user.update({
        where: { id: buyerId },
        data: {
          points: {
            increment: totalPointsToRestore,
          },
        },
      });
    }
  });
}

// ✅ 송장번호 생성 함수 추가
function generateTrackingNumber(): string {
  return String(Math.floor(Math.random() * 10000000000000));
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
