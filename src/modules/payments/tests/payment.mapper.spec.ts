import { toPaymentDto } from '../utils/payment.mapper';

describe('payment.mapper', () => {
  describe('toPaymentDto', () => {
    const basePayment = {
      id: 'pay-1',
      orderId: 'order-1',
      price: 20000,
      paymentMethod: 'CREDIT_CARD',
      status: 'WaitingPayment',
      cardNumber: '3456',
      bankName: null,
      phoneNumber: null,
      transactionId: 'TXN-123',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
      order: {
        id: 'order-1',
        buyerId: 'buyer-1',
        buyerName: '테스트',
        phoneNumber: '010-1111-2222',
        address: '서울시',
        status: 'WaitingPayment',
        usedPoints: 0,
        earnedPoints: 0,
        createdAt: new Date('2026-01-01'),
      },
    };

    test('결제 엔티티를 DTO로 정상 변환한다', () => {
      const dto = toPaymentDto(basePayment);

      expect(dto.id).toBe('pay-1');
      expect(dto.orderId).toBe('order-1');
      expect(dto.price).toBe(20000);
      expect(dto.paymentMethod).toBe('CREDIT_CARD');
      expect(dto.paymentMethodLabel).toBe('신용카드');
      expect(dto.status).toBe('WaitingPayment');
      expect(dto.statusLabel).toBe('결제 대기');
      expect(dto.cardNumber).toBe('3456');
      expect(dto.transactionId).toBe('TXN-123');
      expect(dto.order).toBeDefined();
      expect(dto.order!.buyerId).toBe('buyer-1');
    });

    test('cardNumber가 null이면 undefined를 반환한다', () => {
      const payment = { ...basePayment, cardNumber: null };
      const dto = toPaymentDto(payment);

      expect(dto.cardNumber).toBeUndefined();
    });

    test('bankName이 있으면 변환된다', () => {
      const payment = {
        ...basePayment,
        paymentMethod: 'BANK_TRANSFER',
        bankName: '국민은행',
        cardNumber: null,
      };
      const dto = toPaymentDto(payment);

      expect(dto.bankName).toBe('국민은행');
      expect(dto.paymentMethodLabel).toBe('계좌이체');
    });

    test('phoneNumber가 있으면 변환된다', () => {
      const payment = {
        ...basePayment,
        paymentMethod: 'MOBILE_PHONE',
        phoneNumber: '010-9999-8888',
        cardNumber: null,
      };
      const dto = toPaymentDto(payment);

      expect(dto.phoneNumber).toBe('010-9999-8888');
      expect(dto.paymentMethodLabel).toBe('휴대폰');
    });

    test('order가 null이면 undefined를 반환한다', () => {
      const payment = { ...basePayment, order: null };
      const dto = toPaymentDto(payment);

      expect(dto.order).toBeUndefined();
    });

    test('transactionId가 null이면 undefined를 반환한다', () => {
      const payment = { ...basePayment, transactionId: null };
      const dto = toPaymentDto(payment);

      expect(dto.transactionId).toBeUndefined();
    });

    test('CompletedPayment 상태의 라벨이 정상 변환된다', () => {
      const payment = { ...basePayment, status: 'CompletedPayment' };
      const dto = toPaymentDto(payment);

      expect(dto.statusLabel).toBe('결제 완료');
    });

    test('CanceledPayment 상태의 라벨이 정상 변환된다', () => {
      const payment = { ...basePayment, status: 'CanceledPayment' };
      const dto = toPaymentDto(payment);

      expect(dto.statusLabel).toBe('결제 취소');
    });

    test('FailedPayment 상태의 라벨이 정상 변환된다', () => {
      const payment = { ...basePayment, status: 'FailedPayment' };
      const dto = toPaymentDto(payment);

      expect(dto.statusLabel).toBe('결제 실패');
    });
  });
});
