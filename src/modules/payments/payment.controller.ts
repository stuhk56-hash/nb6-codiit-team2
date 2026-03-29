import { Response } from 'express';
import { paymentService } from './payment.service';
import { AuthenticatedRequest } from '../../types/auth-request.type';
import { requireBuyer } from '../../lib/request/auth-user';

// 결제 생성 POST /api/payments
export async function createPayment(req: AuthenticatedRequest, res: Response) {
  const { orderId, price, paymentMethod, cardNumber, bankName, phoneNumber } =
    req.body;

  const result = await paymentService.createPayment(
    orderId,
    price,
    paymentMethod,
    cardNumber,
    bankName,
    phoneNumber,
  );

  return res.status(201).send({
    success: true,
    message: '결제가 처리되었습니다',
    data: result,
  });
}
// 결제 조회 (주문 ID) GET /api/payments/order/:orderId
export async function getPaymentByOrderId(
  req: AuthenticatedRequest,
  res: Response,
) {
  const buyerId = requireBuyer(req.user).id;
  const { orderId } = req.params;

  const result = await paymentService.getPaymentByOrderId(buyerId, orderId);

  return res.status(200).send({
    success: true,
    data: result,
  });
}

// 사용자 결제 내역 조회 GET /api/payments/user/history
export async function getPaymentsByUserId(
  req: AuthenticatedRequest,
  res: Response,
) {
  const buyerId = requireBuyer(req.user).id;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const status = req.query.status as string | undefined;

  const result = await paymentService.getPaymentsByUserId(
    buyerId,
    limit,
    page,
    status,
  );

  return res.status(200).send({
    success: true,
    ...result,
  });
}

// 결제 조회 (결제 ID) GET /api/payments/:paymentId
export async function getPaymentById(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const { paymentId } = req.params;

  const result = await paymentService.getPaymentById(buyerId, paymentId);

  return res.status(200).send({
    success: true,
    data: result,
  });
}

// 상태별 결제 조회 GET /api/payments (관리자용)
export async function getPaymentsByStatus(
  req: AuthenticatedRequest,
  res: Response,
) {
  const { status } = req.query;

  const result = await paymentService.getPaymentsByStatus(status as string);

  return res.status(200).send({
    success: true,
    data: result,
  });
}

// 결제 취소 PATCH /api/payments/:orderId/cancel
export async function cancelPayment(req: AuthenticatedRequest, res: Response) {
  const buyerId = requireBuyer(req.user).id;
  const { orderId } = req.params;

  const result = await paymentService.cancelPayment(buyerId, orderId);

  return res.status(200).send({
    success: true,
    message: '결제가 취소되었습니다',
    data: result,
  });
}
