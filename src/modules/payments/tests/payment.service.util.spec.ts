import { BadRequestError } from '../../../lib/errors/customErrors';
import {
  validatePaymentMethod,
  validatePaymentAmount,
} from '../utils/payment.service.util';

describe('결제 서비스 유틸 유닛 테스트', () => {
  describe('validatePaymentMethod', () => {
    test('유효한 신용카드 결제 수단은 통과한다', () => {
      expect(() => validatePaymentMethod('CREDIT_CARD')).not.toThrow();
    });

    test('유효한 계좌이체 결제 수단은 통과한다', () => {
      expect(() => validatePaymentMethod('BANK_TRANSFER')).not.toThrow();
    });

    test('유효한 휴대폰 결제 수단은 통과한다', () => {
      expect(() => validatePaymentMethod('MOBILE_PHONE')).not.toThrow();
    });

    test('유효하지 않은 결제 수단은 BadRequestError를 던진다', () => {
      expect(() => validatePaymentMethod('INVALID_METHOD')).toThrow(
        BadRequestError,
      );
    });

    test('빈 문자열은 BadRequestError를 던진다', () => {
      expect(() => validatePaymentMethod('')).toThrow(BadRequestError);
    });

    test('null 값은 BadRequestError를 던진다', () => {
      expect(() => validatePaymentMethod(null as any)).toThrow(BadRequestError);
    });
  });

  describe('validatePaymentAmount', () => {
    test('양의 정수는 통과한다', () => {
      expect(() => validatePaymentAmount(50000)).not.toThrow();
    });

    test('1은 통과한다', () => {
      expect(() => validatePaymentAmount(1)).not.toThrow();
    });

    test('0은 BadRequestError를 던진다', () => {
      expect(() => validatePaymentAmount(0)).toThrow(BadRequestError);
    });

    test('음수는 BadRequestError를 던진다', () => {
      expect(() => validatePaymentAmount(-1)).toThrow(BadRequestError);
    });

    test('소수는 BadRequestError를 던진다', () => {
      expect(() => validatePaymentAmount(50000.5)).toThrow(BadRequestError);
    });

    test('아주 큰 숫자는 통과한다', () => {
      expect(() =>
        validatePaymentAmount(Number.MAX_SAFE_INTEGER),
      ).not.toThrow();
    });
  });
});
