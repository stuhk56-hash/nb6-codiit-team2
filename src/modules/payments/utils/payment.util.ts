import { BadRequestError } from '../../../lib/errors/customErrors';

// 결제 수단 한글 이름으로 변환
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    CREDIT_CARD: '신용카드',
    BANK_TRANSFER: '계좌이체',
    MOBILE_PHONE: '휴대폰',
  };

  return labels[method] || method;
}

// 결제 상태 한글 이름으로 변환
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    WaitingPayment: '결제 대기',
    CompletedPayment: '결제 완료',
    FailedPayment: '결제 실패',
    CanceledPayment: '결제 취소',
  };

  return labels[status] || status;
}

// 결제 정보 마스킹 (보안)
export function maskPaymentDetails(
  cardNumber?: string,
  phoneNumber?: string,
): {
  cardNumber?: string;
  phoneNumber?: string;
} {
  return {
    cardNumber: cardNumber ? `****-****-****-${cardNumber}` : undefined,
    phoneNumber: phoneNumber ? phoneNumber.slice(-4) : undefined,
  };
}

// 결제 가능 상태 확인
export function isPaymentCancellable(status: string): boolean {
  const cancellableStatuses = ['WaitingPayment']; // 결제 대기 중일 때만 취소 가능
  return cancellableStatuses.includes(status);
}

// 결제 재시도 가능 상태 확인
export function isPaymentRetryable(status: string): boolean {
  const retryableStatuses = ['FailedPayment']; // 결제 실패했을 때만 재시도 가능
  return retryableStatuses.includes(status);
}
