import { prisma } from '../../lib/constants/prismaClient';
import { ShippingStatus } from '@prisma/client';

const shippingSelect = {
  id: true,
  orderId: true,
  status: true,
  trackingNumber: true,
  carrier: true,
  readyToShipAt: true,
  inShippingAt: true,
  deliveredAt: true,
  createdAt: true,
  updatedAt: true,
  shippingHistories: {
    select: {
      id: true,
      shippingId: true,
      status: true,
      description: true,
      location: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
} as const;

export async function findShippingByOrderId(orderId: string) {
  return prisma.shipping.findUnique({
    where: { orderId },
    select: shippingSelect,
  });
}

export async function updateShippingStatus(orderId: string, status: string) {
  const shippingStatus = status as ShippingStatus;

  const updateData: any = {
    status: shippingStatus,
  };

  // ✅ 상태에 따라 타임스탬프 자동 업데이트
  if (shippingStatus === ShippingStatus.ReadyToShip) {
    updateData.readyToShipAt = new Date();
  } else if (shippingStatus === ShippingStatus.InShipping) {
    updateData.inShippingAt = new Date();
  } else if (shippingStatus === ShippingStatus.Delivered) {
    updateData.deliveredAt = new Date();
  }

  return prisma.shipping.update({
    where: { orderId },
    data: updateData,
    select: shippingSelect,
  });
}

export async function addShippingHistory(
  shippingId: string,
  data: {
    status: string;
    description: string;
    location?: string;
  },
) {
  return prisma.shippingHistory.create({
    data: {
      shippingId,
      status: data.status,
      description: data.description,
      location: data.location || null,
    },
  });
}
