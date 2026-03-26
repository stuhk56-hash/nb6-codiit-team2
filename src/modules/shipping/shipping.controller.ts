import { Response } from 'express';
import * as shippingService from './shipping.service';
import { AuthenticatedRequest } from '../../types/auth-request.type';

// 배송 정보 조회 GET /api/shipping/:orderId
export async function getShipping(req: AuthenticatedRequest, res: Response) {
  const { orderId } = req.params;

  const result = await shippingService.getShippingByOrderId(orderId);
  return res.status(200).json({
    success: true,
    data: result,
  });
}

// ✅ 배송 상태 자동 진행 POST /api/shipping/:orderId/auto-progress (테스트용)
export async function autoProgressShipping(
  req: AuthenticatedRequest,
  res: Response,
) {
  const { orderId } = req.params;

  const result = await shippingService.autoProgressShippingStatus(orderId);
  return res.status(200).json({
    success: true,
    data: result,
    message: '배송 상태가 다음 단계로 진행되었습니다',
  });
}

// 배송 상태 업데이트 PATCH /api/shipping/:orderId/status
export async function updateShippingStatus(
  req: AuthenticatedRequest,
  res: Response,
) {
  const { orderId } = req.params;
  const { status } = req.body;

  const result = await shippingService.updateShippingStatus(orderId, status);
  return res.status(200).json({
    success: true,
    data: result,
    message: '배송 상태가 업데이트되었습니다',
  });
}
