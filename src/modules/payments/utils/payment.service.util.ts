import { BadRequestError } from '../../../lib/errors/customErrors';

// 결제 수단 검증
export function validatePaymentMethod(paymentMethod: string): void {
  const validMethods = ['CREDIT_CARD', 'BANK_TRANSFER', 'MOBILE_PHONE'];

  if (!validMethods.includes(paymentMethod)) {
    throw new BadRequestError('유효한 결제 수단이 아닙니다');
  }
}

// ✅ 결제 금액 검증 (추가)
export function validatePaymentAmount(price: number): void {
  if (price <= 0) {
    throw new BadRequestError('결제 금액은 0보다 커야 합니다');
  }

  if (!Number.isInteger(price)) {
    throw new BadRequestError('결제 금액은 정수여야 합니다');
  }
}
