import * as shippingRepository from './shipping.repository';
import { NotFoundError, BadRequestError } from '../../lib/errors/customErrors';
import { ShippingStatus } from '@prisma/client';

export async function getShippingByOrderId(orderId: string) {
  if (!orderId) {
    throw new BadRequestError('주문 ID가 필요합니다');
  }

  const shipping = await shippingRepository.findShippingByOrderId(orderId);

  if (!shipping) {
    throw new NotFoundError('배송 정보를 찾을 수 없습니다');
  }

  return shipping;
}

// ✅ 배송 상태 자동 진행 함수 (테스트용)
export async function autoProgressShippingStatus(orderId: string) {
  if (!orderId) {
    throw new BadRequestError('주문 ID가 필요합니다');
  }

  const shipping = await shippingRepository.findShippingByOrderId(orderId);

  if (!shipping) {
    throw new NotFoundError('배송 정보를 찾을 수 없습니다');
  }

  // 현재 상태에 따라 다음 상태로 변경
  let nextStatus: ShippingStatus;

  switch (shipping.status) {
    case ShippingStatus.ReadyToShip:
      nextStatus = ShippingStatus.InShipping;
      break;
    case ShippingStatus.InShipping:
      nextStatus = ShippingStatus.Delivered;
      break;
    case ShippingStatus.Delivered:
      // 이미 배송완료면 변경 안 함
      return shipping;
    default:
      nextStatus = ShippingStatus.ReadyToShip;
  }

  return await shippingRepository.updateShippingStatus(orderId, nextStatus);
}

export async function updateShippingStatus(orderId: string, status: string) {
  if (!orderId || !status) {
    throw new BadRequestError('주문 ID와 상태가 필요합니다');
  }

  const shipping = await shippingRepository.updateShippingStatus(
    orderId,
    status,
  );

  if (!shipping) {
    throw new NotFoundError('배송 정보를 찾을 수 없습니다');
  }

  return shipping;
}
