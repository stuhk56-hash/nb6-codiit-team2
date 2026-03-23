import { Response } from 'express';
import * as ordersService from './orders.service';
import { AuthenticatedRequest } from '../../types/auth-request.type';
import { requireBuyer } from '../../lib/request/auth-user';

//주문 목록 조회GET /api/orders
export async function getOrders(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const status = req.query.status as string | undefined;

  const result = await ordersService.getOrders(buyerId, limit, page, status);
  return res.status(200).send(result);
}

//주문 상세 조회 GET /api/orders/:orderId
export async function getOrdersById(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const { orderId } = req.params;

  const result = await ordersService.getOrdersById(buyerId, orderId);
  return res.status(200).send(result);
}

//주문 생성 POST /api/orders
export async function createOrder(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const createOrderDto = req.body;

  const result = await ordersService.createOrder(buyerId, createOrderDto);
  return res.status(201).send(result);
}

//주문 정보 수정 PATCH /api/orders/:orderId
export async function updateOrder(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const { orderId } = req.params;
  const updateOrderDto = req.body;

  const result = await ordersService.updateOrder(
    buyerId,
    orderId,
    updateOrderDto,
  );
  return res.status(200).send(result);
}

//주문 취소 DELETE /api/orders/:orderId
export async function cancelOrder(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const { orderId } = req.params;

  const result = await ordersService.cancelOrder(buyerId, orderId);
  return res.status(200).send(result);
}
