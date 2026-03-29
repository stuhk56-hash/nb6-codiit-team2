import { shippingRepository } from './shipping.repository';
import { NotFoundError, BadRequestError } from '../../lib/errors/customErrors';
import { ShippingStatus } from '@prisma/client';

export class ShippingService {
  async getShippingByOrderId(orderId: string) {
    if (!orderId) {
      throw new BadRequestError('주문 ID가 필요합니다');
    }

    const shipping = await shippingRepository.findShippingByOrderId(orderId);

    if (!shipping) {
      throw new NotFoundError('배송 정보를 찾을 수 없습니다');
    }

    return shipping;
  }

  async autoProgressShippingStatus(orderId: string) {
    if (!orderId) {
      throw new BadRequestError('주문 ID가 필요합니다');
    }

    const shipping = await shippingRepository.findShippingByOrderId(orderId);

    if (!shipping) {
      throw new NotFoundError('배송 정보를 찾을 수 없습니다');
    }

    let nextStatus: ShippingStatus;

    switch (shipping.status) {
      case ShippingStatus.ReadyToShip:
        nextStatus = ShippingStatus.InShipping;
        break;
      case ShippingStatus.InShipping:
        nextStatus = ShippingStatus.Delivered;
        break;
      case ShippingStatus.Delivered:
        return shipping;
      default:
        nextStatus = ShippingStatus.ReadyToShip;
    }

    return await shippingRepository.updateShippingStatus(orderId, nextStatus);
  }

  async updateShippingStatus(orderId: string, status: string) {
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
}

export const shippingService = new ShippingService();
