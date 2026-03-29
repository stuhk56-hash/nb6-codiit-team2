import type { Order } from "@/types/order";

export function canCancelOrder(order: Order | null | undefined): boolean {
  // 배송 상태로 확인 (배송준비중이면 취소 가능)
  if (order?.shipping?.status === "ReadyToShip") {
    return true;
  }
  // 그 외는 취소 불가능
  return false;
}

export function getCancelRestrictReason(order: Order | null | undefined): string {
  if (!order?.shipping) {
    return "배송 정보가 없습니다.";
  }

  if (order.shipping.status === "InShipping") {
    return "배송 중인 주문은 취소할 수 없습니다.";
  }

  if (order.shipping.status === "Delivered") {
    return "배송 완료된 주문은 취소할 수 없습니다.";
  }

  return "이 주문은 취소할 수 없습니다.";
}
