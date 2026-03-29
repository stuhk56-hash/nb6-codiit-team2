import {
  OrderWithRelations,
  OrderItemWithRelations,
  PaymentWithRelations,
  ShippingWithRelations,
} from '../types/orders.type';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderItemDto } from '../dto/order-item.dto';
import { PaymentDto } from '../dto/payment.dto';
import { ShippingDto } from '../dto/shipping.dto';

//order 엔티티를 응답 DTO로 변환
export function toOrderDto(order: any): OrderResponseDto {
  return {
    id: order.id,
    buyerId: order.buyerId,
    buyerName: order.buyerName,
    phoneNumber: order.phoneNumber,
    address: order.address,
    usedPoints: order.usedPoints,
    earnedPoints: order.earnedPoints,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items || order.orderItems || [], // ✅ items로 통일
    payment: order.payment, // ✅ payment (단수)
    shipping: order.shipping,
  };
}

export function toOrderItemDto(
  orderItem: OrderItemWithRelations,
): OrderItemDto {
  return {
    id: orderItem.id,
    price: orderItem.unitPrice,
    quantity: orderItem.quantity,
    productId: orderItem.productId,
    product: {
      name: orderItem.product.name,
      image: orderItem.productImageUrl || '',
      reviews: (orderItem.product.reviews || []).map((review) => ({
        id: review.id,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt.toISOString(),
      })),
    },
    size: {
      id: orderItem.size.id,
      size: {
        en: orderItem.size.nameEn,
        ko: orderItem.size.nameKo,
      },
    },
    isReviewed: (orderItem.reviews && orderItem.reviews.length > 0) || false,
  };
}

//Payment 엔티티를 DTO로 변환
export function toPaymentDto(
  payment: PaymentWithRelations | null,
): PaymentDto | null {
  if (!payment) {
    return null;
  }

  return {
    id: payment.id,
    price: payment.price,
    status: payment.status,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    orderId: payment.orderId,
  };
}

// Shipping 엔티티를 DTO로 변환
export function toShippingDto(
  shipping: ShippingWithRelations | null,
): ShippingDto | null {
  if (!shipping) {
    return null;
  }

  return {
    id: shipping.id,
    status: shipping.status,
    trackingNumber: shipping.trackingNumber,
    carrier: shipping.carrier,
    readyToShipAt: shipping.readyToShipAt?.toISOString() || null,
    inShippingAt: shipping.inShippingAt?.toISOString() || null,
    deliveredAt: shipping.deliveredAt?.toISOString() || null,
    createdAt: shipping.createdAt.toISOString(),
    updatedAt: shipping.updatedAt.toISOString(),
  };
}
