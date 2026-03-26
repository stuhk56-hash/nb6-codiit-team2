// 주문 수정 가능 여부 확인
export function isOrderEditable(status: string): boolean {
  return status === 'WaitingPayment' || status === 'ReadyToShip';
}

// 주문 취소 가능 여부 확인
export function isOrderCancellable(status: string): boolean {
  return (
    status === 'WaitingPayment' ||
    status === 'CompletedPayment' ||
    status === 'ReadyToShip'
  );
}
