import * as ordersRepository from '../orders.repository';
import { CreateOrderDto } from '../dto/create-order.dto';
import {
  OrderWithRelations,
  OrderItemWithRelations,
  OrderSelectResult, // ✅ 추가
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
export function validateOrderCancellation(
  paymentStatus: string,
  shippingStatus?: string, // ✅ 배송 상태 추가
): void {
  // ✅ 배송 준비중일 때만 취소 가능
  if (shippingStatus && shippingStatus !== 'ReadyToShip') {
    throw new BadRequestError(
      `${shippingStatus === 'InShipping' ? '배송 중' : '배송 완료'}인 주문은 취소할 수 없습니다.`,
    );
  }

  // ✅ 결제 대기 상태가 아니면 취소 불가
  if (
    paymentStatus !== 'WaitingPayment' &&
    paymentStatus !== 'CompletedPayment'
  ) {
    throw new BadRequestError('이미 처리된 주문은 취소할 수 없습니다.');
  }
}

// ✅ OrderSelectResult를 OrderWithRelations로 변환
export async function resolveOrderItemImages(
  order: OrderSelectResult | OrderWithRelations,
): Promise<OrderWithRelations> {
  // items 배열이 있으면 처리
  if (order.items && Array.isArray(order.items)) {
    await Promise.all(
      order.items.map(async (item: any) => {
        if (!item.productImageUrl && item.product?.imageUrl) {
          item.productImageUrl = await resolveS3ImageUrl(
            item.product.imageUrl,
            null,
            '/images/Mask-group.svg',
          );
        }
      }),
    );
  }

  return order as OrderWithRelations;
}

// ✅ 여러 주문의 이미지 해석
export async function resolveOrdersItemImages(
  orders: OrderSelectResult[] | OrderWithRelations[],
): Promise<OrderWithRelations[]> {
  return Promise.all(orders.map(resolveOrderItemImages));
}
