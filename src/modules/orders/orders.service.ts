import { orderRepository } from './orders.repository';
import * as orderServiceUtil from './utils/orders.service.util';
import * as ordersUtil from './utils/orders.util';
import { toOrderDto } from './utils/orders.mapper';
import {
  OrderResponseDto,
  OrderPaginatedResponseDto,
  CreateOrderDto,
  UpdateOrderDto,
} from './dto/index';
import { NotFoundError, BadRequestError } from '../../lib/errors/customErrors';

export class OrderService {
  async getOrders(
    buyerId: string,
    limit: number = 10,
    page: number = 1,
    status?: string,
  ): Promise<OrderPaginatedResponseDto> {
    if (page < 1 || limit < 1) {
      throw new BadRequestError('잘못된 입력값입니다.');
    }

    const { orders, total } = await orderRepository.findOrdersByUserId(
      buyerId,
      limit,
      page,
      status,
    );
    const resolvedOrders =
      await orderServiceUtil.resolveOrdersItemImages(orders);
    const totalPages = Math.ceil(total / limit);

    return {
      data: resolvedOrders.map(toOrderDto),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getOrdersById(
    buyerId: string,
    orderId: string,
  ): Promise<OrderResponseDto> {
    if (!orderId) {
      throw new BadRequestError('잘못된 요청입니다.');
    }

    const order = await orderRepository.findOrderById(orderId);

    if (!order) {
      throw new NotFoundError('주문을 찾을 수 없습니다.');
    }

    orderServiceUtil.validateOrderOwnership(order.buyerId, buyerId);

    const resolvedOrder = await orderServiceUtil.resolveOrderItemImages(order);
    return toOrderDto(resolvedOrder);
  }

  async createOrder(
    buyerId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    orderServiceUtil.validateShippingInfo(
      createOrderDto.name,
      createOrderDto.phone,
      createOrderDto.address,
    );

    if (
      !Array.isArray(createOrderDto.orderItems) ||
      createOrderDto.orderItems.length === 0
    ) {
      throw new BadRequestError('주문 상품이 없습니다.');
    }

    for (const item of createOrderDto.orderItems) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 999
      ) {
        throw new BadRequestError('유효하지 않은 수량입니다.');
      }
    }

    const { processedItems, totalPrice } =
      await orderServiceUtil.validateAndCalculateOrderItems(
        createOrderDto.orderItems,
      );

    orderServiceUtil.validatePointUsage(createOrderDto.usePoint, totalPrice);

    const order = await orderRepository.createOrderWithTransaction(
      buyerId,
      {
        buyerName: createOrderDto.name,
        phoneNumber: createOrderDto.phone,
        address: createOrderDto.address,
        usedPoints: createOrderDto.usePoint,
      },
      processedItems,
      totalPrice,
      createOrderDto.usePoint,
    );

    const resolvedOrder = await orderServiceUtil.resolveOrderItemImages(order!);
    return toOrderDto(resolvedOrder);
  }

  async updateOrder(
    buyerId: string,
    orderId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    if (!orderId) {
      throw new BadRequestError('잘못된 요청입니다.');
    }

    const order = await orderRepository.findOrderById(orderId);

    if (!order) {
      throw new NotFoundError('주문을 찾을 수 없습니다.');
    }

    orderServiceUtil.validateOrderOwnership(order.buyerId, buyerId);

    const updateData: any = {};
    if (updateOrderDto.name) updateData.buyerName = updateOrderDto.name;
    if (updateOrderDto.phone) updateData.phoneNumber = updateOrderDto.phone;
    if (updateOrderDto.address) updateData.address = updateOrderDto.address;

    const updatedOrder = await orderRepository.updateOrder(orderId, updateData);

    const resolvedOrder =
      await orderServiceUtil.resolveOrderItemImages(updatedOrder);
    return toOrderDto(resolvedOrder);
  }

  async cancelOrder(
    buyerId: string,
    orderId: string,
  ): Promise<OrderResponseDto> {
    if (!orderId) {
      throw new BadRequestError('주문 ID가 필요합니다');
    }

    const order = await orderRepository.findOrderById(orderId);

    if (!order) {
      throw new NotFoundError('주문을 찾을 수 없습니다');
    }

    if (order.buyerId !== buyerId) {
      throw new BadRequestError('접근 권한이 없습니다');
    }

    if (order.shipping?.status && order.shipping.status !== 'ReadyToShip') {
      throw new BadRequestError(
        `${
          order.shipping.status === 'InShipping' ? '배송 중' : '배송 완료'
        }인 주문은 취소할 수 없습니다`,
      );
    }

    if (
      !['WaitingPayment', 'CompletedPayment', 'ReadyToShip'].includes(
        order.status,
      )
    ) {
      throw new BadRequestError('취소할 수 없는 주문입니다');
    }

    try {
      await orderRepository.cancelOrderWithTransaction(buyerId, orderId);

      const canceledOrder = await orderRepository.findOrderById(orderId);
      return toOrderDto(canceledOrder);
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error ? error.message : '주문 취소 실패',
      );
    }
  }
}

export const orderService = new OrderService();
