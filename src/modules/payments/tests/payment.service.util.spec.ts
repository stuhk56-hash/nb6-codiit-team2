import {
  validatePaymentMethod,
  validatePaymentAmount,
} from '../utils/payment.service.util';
import { BadRequestError } from '../../../lib/errors/customErrors';

describe('payment.service.util', () => {
  // ─── validatePaymentMethod ───
  describe('validatePaymentMethod', () => {
    test('CREDIT_CARD는 유효하다', () => {
      expect(() => validatePaymentMethod('CREDIT_CARD')).not.toThrow();
    });

    test('BANK_TRANSFER는 유효하다', () => {
      expect(() => validatePaymentMethod('BANK_TRANSFER')).not.toThrow();
    });

    test('MOBILE_PHONE는 유효하다', () => {
      expect(() => validatePaymentMethod('MOBILE_PHONE')).not.toThrow();
    });

    test('유효하지 않은 결제 수단이면 BadRequestError를 던진다', () => {
      expect(() => validatePaymentMethod('BITCOIN')).toThrow(BadRequestError);
    });

    test('빈 문자열이면 BadRequestError를 던진다', () => {
      expect(() => validatePaymentMethod('')).toThrow(BadRequestError);
    });
  });

  // ─── validatePaymentAmount ───
  describe('validatePaymentAmount', () => {
    test('양의 정수는 유효하다', () => {
      expect(() => validatePaymentAmount(10000)).not.toThrow();
    });

    test('1은 유효하다', () => {
      expect(() => validatePaymentAmount(1)).not.toThrow();
    });

    test('0이면 BadRequestError를 던진다', () => {
      expect(() => validatePaymentAmount(0)).toThrow(BadRequestError);
    });

    test('음수이면 BadRequestError를 던진다', () => {
      expect(() => validatePaymentAmount(-1000)).toThrow(BadRequestError);
    });

    test('소수이면 BadRequestError를 던진다', () => {
      expect(() => validatePaymentAmount(100.5)).toThrow(BadRequestError);
    });
  });
});
