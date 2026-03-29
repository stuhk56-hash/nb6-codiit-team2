import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  maskPaymentDetails,
  isPaymentCancellable,
  isPaymentRetryable,
} from '../utils/payment.util';

describe('payment.util', () => {
  // ─── getPaymentMethodLabel ───
  describe('getPaymentMethodLabel', () => {
    test('CREDIT_CARD는 신용카드를 반환한다', () => {
      expect(getPaymentMethodLabel('CREDIT_CARD')).toBe('신용카드');
    });

    test('BANK_TRANSFER는 계좌이체를 반환한다', () => {
      expect(getPaymentMethodLabel('BANK_TRANSFER')).toBe('계좌이체');
    });

    test('MOBILE_PHONE는 휴대폰를 반환한다', () => {
      expect(getPaymentMethodLabel('MOBILE_PHONE')).toBe('휴대폰');
    });

    test('알 수 없는 값이면 그대로 반환한다', () => {
      expect(getPaymentMethodLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  // ─── getPaymentStatusLabel ��──
  describe('getPaymentStatusLabel', () => {
    test('WaitingPayment는 결제 대기를 반환한다', () => {
      expect(getPaymentStatusLabel('WaitingPayment')).toBe('결제 대기');
    });

    test('CompletedPayment는 결제 완료를 반환한다', () => {
      expect(getPaymentStatusLabel('CompletedPayment')).toBe('결제 완료');
    });

    test('FailedPayment는 결제 실패를 반환한다', () => {
      expect(getPaymentStatusLabel('FailedPayment')).toBe('결제 실패');
    });

    test('CanceledPayment는 결제 취소를 반환한다', () => {
      expect(getPaymentStatusLabel('CanceledPayment')).toBe('결제 취소');
    });

    test('알 수 없는 값이면 그대로 반환한다', () => {
      expect(getPaymentStatusLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  // ─── maskPaymentDetails ───
  describe('maskPaymentDetails', () => {
    test('카드번호를 마스킹한다', () => {
      const result = maskPaymentDetails('3456', undefined);
      expect(result.cardNumber).toBe('****-****-****-3456');
      expect(result.phoneNumber).toBeUndefined();
    });

    test('전화번호 뒷 4자리만 남긴다', () => {
      const result = maskPaymentDetails(undefined, '01099998888');
      expect(result.phoneNumber).toBe('8888');
      expect(result.cardNumber).toBeUndefined();
    });

    test('둘 다 없으면 둘 다 undefined를 반환한다', () => {
      const result = maskPaymentDetails(undefined, undefined);
      expect(result.cardNumber).toBeUndefined();
      expect(result.phoneNumber).toBeUndefined();
    });

    test('둘 다 있으면 둘 다 마스킹한다', () => {
      const result = maskPaymentDetails('3456', '01099998888');
      expect(result.cardNumber).toBe('****-****-****-3456');
      expect(result.phoneNumber).toBe('8888');
    });
  });

  // ─── isPaymentCancellable ───
  describe('isPaymentCancellable', () => {
    test('WaitingPayment이면 true를 반환한다', () => {
      expect(isPaymentCancellable('WaitingPayment')).toBe(true);
    });

    test('CompletedPayment이면 false를 반환한다', () => {
      expect(isPaymentCancellable('CompletedPayment')).toBe(false);
    });

    test('CanceledPayment이면 false를 반환한다', () => {
      expect(isPaymentCancellable('CanceledPayment')).toBe(false);
    });

    test('FailedPayment이면 false를 반환한다', () => {
      expect(isPaymentCancellable('FailedPayment')).toBe(false);
    });
  });

  // ─── isPaymentRetryable ───
  describe('isPaymentRetryable', () => {
    test('FailedPayment이면 true를 반환한다', () => {
      expect(isPaymentRetryable('FailedPayment')).toBe(true);
    });

    test('WaitingPayment이면 false를 반환한다', () => {
      expect(isPaymentRetryable('WaitingPayment')).toBe(false);
    });

    test('CompletedPayment이면 false를 반환한다', () => {
      expect(isPaymentRetryable('CompletedPayment')).toBe(false);
    });

    test('CanceledPayment이면 false를 반환한다', () => {
      expect(isPaymentRetryable('CanceledPayment')).toBe(false);
    });
  });
});
