import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  maskPaymentDetails,
  isPaymentCancellable,
  isPaymentRetryable,
} from '../utils/payment.util';

describe('결제 유틸 유닛 테스트', () => {
  describe('getPaymentMethodLabel', () => {
    test('CREDIT_CARD는 신용카드로 반환한다', () => {
      expect(getPaymentMethodLabel('CREDIT_CARD')).toBe('신용카드');
    });

    test('BANK_TRANSFER는 계좌이체로 반환한다', () => {
      expect(getPaymentMethodLabel('BANK_TRANSFER')).toBe('계좌이체');
    });

    test('MOBILE_PHONE는 휴대폰으로 반환한다', () => {
      expect(getPaymentMethodLabel('MOBILE_PHONE')).toBe('휴대폰');
    });

    test('알 수 없는 값은 그대로 반환한다', () => {
      expect(getPaymentMethodLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getPaymentStatusLabel', () => {
    test('WaitingPayment는 결제 대기로 반환한다', () => {
      expect(getPaymentStatusLabel('WaitingPayment')).toBe('결제 대기');
    });

    test('CompletedPayment는 결제 완료로 반환한다', () => {
      expect(getPaymentStatusLabel('CompletedPayment')).toBe('결제 완료');
    });

    test('FailedPayment는 결제 실패로 반환한다', () => {
      expect(getPaymentStatusLabel('FailedPayment')).toBe('결제 실패');
    });

    test('CanceledPayment는 결제 취소로 반환한다', () => {
      expect(getPaymentStatusLabel('CanceledPayment')).toBe('결제 취소');
    });

    test('알 수 없는 값은 그대로 반환한다', () => {
      expect(getPaymentStatusLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('maskPaymentDetails', () => {
    test('신용카드 번호를 마스킹한다', () => {
      const result = maskPaymentDetails('1234567890123456', undefined);
      // 마지막 4글자만 표시
      expect(result.cardNumber).toContain('3456');
      expect(result.phoneNumber).toBeUndefined();
    });

    test('휴대폰 번호를 마스킹한다', () => {
      const result = maskPaymentDetails(undefined, '01012345678');
      expect(result.cardNumber).toBeUndefined();
      expect(result.phoneNumber).toBe('5678');
    });

    test('둘 다 제공되면 둘 다 마스킹한다', () => {
      const result = maskPaymentDetails('1234567890123456', '01012345678');
      expect(result.cardNumber).toContain('3456');
      expect(result.phoneNumber).toBe('5678');
    });

    test('둘 다 제공되지 않으면 undefined로 반환한다', () => {
      const result = maskPaymentDetails(undefined, undefined);
      expect(result.cardNumber).toBeUndefined();
      expect(result.phoneNumber).toBeUndefined();
    });
  });

  describe('isPaymentCancellable', () => {
    test('WaitingPayment는 취소 가능하다', () => {
      expect(isPaymentCancellable('WaitingPayment')).toBe(true);
    });

    test('CompletedPayment는 취소 불가능하다', () => {
      expect(isPaymentCancellable('CompletedPayment')).toBe(false);
    });

    test('CanceledPayment는 취소 불가능하다', () => {
      expect(isPaymentCancellable('CanceledPayment')).toBe(false);
    });

    test('FailedPayment는 취소 불가능하다', () => {
      expect(isPaymentCancellable('FailedPayment')).toBe(false);
    });
  });

  describe('isPaymentRetryable', () => {
    test('FailedPayment는 재시도 가능하다', () => {
      expect(isPaymentRetryable('FailedPayment')).toBe(true);
    });

    test('CompletedPayment는 재시도 불가능하다', () => {
      expect(isPaymentRetryable('CompletedPayment')).toBe(false);
    });

    test('CanceledPayment는 재시도 불가능하다', () => {
      expect(isPaymentRetryable('CanceledPayment')).toBe(false);
    });

    test('WaitingPayment는 재시도 불가능하다', () => {
      expect(isPaymentRetryable('WaitingPayment')).toBe(false);
    });
  });
});
