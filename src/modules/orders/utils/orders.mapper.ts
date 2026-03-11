import {
  OrderWithRelations,
  OrderItemWithRelations,
  PaymentWithRelations,
} from '../types/orders.type';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderItemDto } from '../dto/order-item.dto';
import { PaymentDto } from '../dto/payment.dto';

//order 엔티티를 응답 DTO로 변환
export function toOrderDto(order: OrderWithRelations): OrderResponseDto {
  return {
    id: order.id,
    buyerName: order.buyerName,
    phoneNumber: order.phoneNumber,
    address: order.address,
    usedPoints: order.usedPoints,
    earnedPoints: order.earnedPoints,
    createdAt: order.createdAt.toISOString(),
    orderItems: order.items.map((item) => toOrderItemDto(item)),
    payments: toPaymentDto(order.payment),
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
export function toPaymentDto(payment: PaymentWithRelations): PaymentDto {
  return {
    id: payment.id,
    price: payment.price,
    status: payment.status,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    orderId: payment.orderId,
  };
}
