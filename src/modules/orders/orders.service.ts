import * as orderRepository from './orders.repository';
import * as orderServiceUtil from './utils/orders.service.util';
import { toOrderDto } from './utils/orders.mapper';
import {
  OrderResponseDto,
  OrderPaginatedResponseDto,
  CreateOrderDto,
  UpdateOrderDto,
} from './dto/index';
import { NotFoundError, BadRequestError } from '../../lib/errors/customErrors';

//주문 목록 조회 GET /api/orders
export async function getOrders(
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
  const totalPages = Math.ceil(total / limit);

  return {
    data: orders.map((order) => toOrderDto(order)),
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

//주문 상세 조회 GET /api/orders/{orderId}
export async function getOrdersById(
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

  return toOrderDto(order);
}

//주문 생성 POST /api/orders (트랜잭션)
export async function createOrder(
  buyerId: string,
  createOrderDto: CreateOrderDto,
): Promise<OrderResponseDto> {
  //배송정보 검증
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

  //상품검증, 가격계산
  const { processedItems, totalPrice } =
    await orderServiceUtil.validateAndCalculateOrderItems(
      createOrderDto.orderItems,
    );
  //포인트 검증
  orderServiceUtil.validatePointUsage(createOrderDto.usePoint, totalPrice);

  //주문 생성
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

  return toOrderDto(order!);
}

//주문 정보 수정 PATCH /api/orders/{orderId}
export async function updateOrder(
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

  //주문자 id확인
  orderServiceUtil.validateOrderOwnership(order.buyerId, buyerId);

  const updateData: any = {};
  if (updateOrderDto.name) updateData.buyerName = updateOrderDto.name;
  if (updateOrderDto.phone) updateData.phoneNumber = updateOrderDto.phone;
  if (updateOrderDto.address) updateData.address = updateOrderDto.address;

  const updatedOrder = await orderRepository.updateOrder(orderId, updateData);

  return toOrderDto(updatedOrder);
}

//주문 취소(트랜잭션) DELETE /api/orders/{orderId}
export async function cancelOrder(
  buyerId: string,
  orderId: string,
): Promise<{ message: string }> {
  if (!orderId) {
    throw new BadRequestError('잘못된 요청입니다.');
  }

  const order = await orderRepository.findOrderById(orderId);

  if (!order) {
    throw new NotFoundError('주문을 찾을 수 없습니다.');
  }

  orderServiceUtil.validateOrderOwnership(order.buyerId, buyerId);
  orderServiceUtil.validateOrderCancellation(order.payment.status);

  //트랜잭션
  await orderRepository.cancelOrderWithTransaction(
    buyerId,
    orderId,
    order.usedPoints,
  );

  return {
    message: '주문이 성공적으로 취소되고 포인트가 복구되었습니다.',
  };
}
