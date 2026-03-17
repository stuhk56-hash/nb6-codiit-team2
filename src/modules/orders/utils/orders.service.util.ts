import * as ordersRepository from '../orders.repository';
import { CreateOrderDto } from '../dto/create-order.dto';
import {
  OrderWithRelations,
  OrderItemWithRelations,
} from '../types/orders.type';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../../../lib/errors/customErrors';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';

//주문 아이템 검증 및 가격 계산

export async function validateAndCalculateOrderItems(
  orderItems: CreateOrderDto['orderItems'],
) {
  let totalPrice = 0;
  const processedItems = [];

  for (const item of orderItems) {
    const stock = await ordersRepository.checkProductStock(
      item.productId,
      item.sizeId,
    );

    if (!stock) {
      throw new NotFoundError('상품을 찾을 수 없습니다.');
    }

    if (stock.quantity < item.quantity) {
      throw new ConflictError('재고가 부족합니다.');
    }

    const itemTotal = stock.product.price * item.quantity;
    totalPrice += itemTotal;
    processedItems.push({
      productId: item.productId,
      sizeId: item.sizeId,
      quantity: item.quantity,
      unitPrice: stock.product.price,
      productName: stock.product.name,
      productImageUrl: stock.product.imageUrl ?? null,
    });
  }

  return {
    processedItems,
    totalPrice,
  };
}

//포인트 사용 검증

export function validatePointUsage(usePoint: number, totalPrice: number): void {
  if (usePoint < 0) {
    throw new BadRequestError('포인트는 0 이상이어야 합니다.');
  }

  if (usePoint > totalPrice) {
    throw new BadRequestError('사용할 포인트가 주문 금액을 초과합니다.');
  }
}

//배송 정보 검증

export function validateShippingInfo(
  name: string,
  phone: string,
  address: string,
): void {
  if (!name || !phone || !address) {
    throw new BadRequestError('배송 정보를 입력해주세요.');
  }
}

//주문 접근 권한 검증

export function validateOrderOwnership(
  orderBuyerId: string,
  requestBuyerId: string,
): void {
  if (orderBuyerId !== requestBuyerId) {
    throw new BadRequestError('접근 권한이 없습니다.');
  }
}

//주문 취소 가능 여부 검증

export function validateOrderCancellation(paymentStatus: string): void {
  if (paymentStatus !== 'Pending') {
    throw new BadRequestError('취소할 수 없는 주문입니다.');
  }
}

export async function resolveOrderItemImages(order: OrderWithRelations) {
  await Promise.all(
    order.items.map(async function (item: OrderItemWithRelations) {
      if (!item.productImageUrl) {
        item.productImageUrl = await resolveS3ImageUrl(
          item.product.imageUrl,
          null,
          '/images/Mask-group.svg',
        );
      }
    }),
  );

  return order;
}

export async function resolveOrdersItemImages(orders: OrderWithRelations[]) {
  return Promise.all(orders.map(resolveOrderItemImages));
}
