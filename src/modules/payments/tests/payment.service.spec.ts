import { paymentRepository } from '../payment.repository';
import { PaymentService } from '../payment.service';
import * as paymentServiceUtil from '../utils/payment.service.util';
import * as paymentUtil from '../utils/payment.util';
import { toPaymentDto } from '../utils/payment.mapper';
import {
  BadRequestError,
  NotFoundError,
} from '../../../lib/errors/customErrors';

jest.mock('../payment.repository');
jest.mock('../utils/payment.service.util');
jest.mock('../utils/payment.util');
jest.mock('../utils/payment.mapper');

function createPayment(partial: Partial<any> = {}) {
  const baseDate = new Date('2026-03-27T00:00:00.000Z');

  return {
    id: 'payment-1',
    orderId: 'order-1',
    price: 50000,
    paymentMethod: 'CREDIT_CARD',
    status: 'CompletedPayment',
    cardNumber: '3456',
    bankName: null,
    phoneNumber: null,
    transactionId: 'TXN-ABC123',
    createdAt: baseDate,
    updatedAt: baseDate,
    order: {
      id: 'order-1',
      buyerId: 'buyer-1',
      buyerName: 'test-buyer',
      phoneNumber: '010-1234-5678',
      address: '서울시 강남구',
      status: 'CompletedPayment',
      usedPoints: 5000,
      earnedPoints: 5000,
      createdAt: baseDate,
    },
    ...partial,
  } as any;
}

describe('결제 서비스 유닛 테스트', () => {
  const service = new PaymentService();

  beforeEach(() => {
    jest.clearAllMocks();
    (paymentServiceUtil.validatePaymentMethod as jest.Mock).mockImplementation(
      () => {},
    );
    (paymentServiceUtil.validatePaymentAmount as jest.Mock).mockImplementation(
      () => {},
    );
    (paymentUtil.isPaymentCancellable as jest.Mock).mockImplementation(
      () => true,
    );
    (toPaymentDto as jest.Mock).mockImplementation((payment: any) => payment);
  });

  describe('createPayment', () => {
    test('필수 정보가 누락되면 BadRequestError를 던진다', async () => {
      try {
        await service.createPayment('', 50000, 'CREDIT_CARD');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain('필수');
      }
    });

    test('price가 없으면 BadRequestError를 던진다', async () => {
      try {
        await service.createPayment('order-1', 0, 'CREDIT_CARD');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain('필수');
      }
    });

    test('paymentMethod가 없으면 BadRequestError를 던진다', async () => {
      try {
        await service.createPayment('order-1', 50000, '');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain('필수');
      }
    });

    test('결제 수단 검증에 실패하면 BadRequestError를 던진다', async () => {
      (
        paymentServiceUtil.validatePaymentMethod as jest.Mock
      ).mockImplementation(() => {
        throw new BadRequestError('유효한 결제 수단이 아닙니다');
      });

      try {
        await service.createPayment('order-1', 50000, 'INVALID_METHOD');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('결제 금액 검증에 실패하면 BadRequestError를 던진다', async () => {
      (
        paymentServiceUtil.validatePaymentAmount as jest.Mock
      ).mockImplementation(() => {
        throw new BadRequestError('결제 금액은 0보다 커야 합니다');
      });

      try {
        await service.createPayment('order-1', 50000, 'CREDIT_CARD');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('신용카드 결제를 생성하고 DTO로 반환한다', async () => {
      const createdPayment = createPayment();
      (paymentRepository.createPayment as jest.Mock).mockResolvedValue(
        createdPayment,
      );

      const result = await service.createPayment(
        'order-1',
        50000,
        'CREDIT_CARD',
        '1234567890123456',
      );

      expect(result.id).toBe('payment-1');
    });

    test('계좌이체 결제를 생성한다', async () => {
      const createdPayment = createPayment();
      (paymentRepository.createPayment as jest.Mock).mockResolvedValue(
        createdPayment,
      );

      const result = await service.createPayment(
        'order-1',
        50000,
        'BANK_TRANSFER',
        undefined,
        '국민은행',
      );

      expect(result).toBeDefined();
    });

    test('휴대폰 결제를 생성한다', async () => {
      const createdPayment = createPayment();
      (paymentRepository.createPayment as jest.Mock).mockResolvedValue(
        createdPayment,
      );

      const result = await service.createPayment(
        'order-1',
        50000,
        'MOBILE_PHONE',
        undefined,
        undefined,
        '01012345678',
      );

      expect(result).toBeDefined();
    });

    test('저장소에서 예외가 발생하면 BadRequestError로 변환한다', async () => {
      (paymentRepository.createPayment as jest.Mock).mockRejectedValue(
        new Error('주문을 찾을 수 없습니다'),
      );

      try {
        await service.createPayment('order-1', 50000, 'CREDIT_CARD');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain('주문을 찾을 수 없습니다');
      }
    });

    test('저장소에서 일반 Error가 발생하면 기본 메시지로 변환한다', async () => {
      (paymentRepository.createPayment as jest.Mock).mockRejectedValue(
        new Error(''),
      );

      try {
        await service.createPayment('order-1', 50000, 'CREDIT_CARD');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toBe('결제 생성 실패');
      }
    });

    test('모든 유효성 검사를 통과한 후 저장소를 호출한다', async () => {
      const createdPayment = createPayment();
      (paymentRepository.createPayment as jest.Mock).mockResolvedValue(
        createdPayment,
      );

      await service.createPayment('order-1', 50000, 'CREDIT_CARD');

      expect(paymentRepository.createPayment).toHaveBeenCalled();
    });
  });

  describe('getPaymentByOrderId', () => {
    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      try {
        await service.getPaymentByOrderId('buyer-1', '');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('결제 정보가 없으면 NotFoundError를 던진다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        null,
      );

      try {
        await service.getPaymentByOrderId('buyer-1', 'order-1');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    test('다른 사용자의 결제 정보 조회는 BadRequestError를 던진다', async () => {
      const payment = createPayment({
        order: { ...createPayment().order, buyerId: 'other-buyer' },
      });
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        payment,
      );

      try {
        await service.getPaymentByOrderId('buyer-1', 'order-1');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('본인 결제 정보를 조회하면 DTO로 반환한다', async () => {
      const payment = createPayment();
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        payment,
      );

      const result = await service.getPaymentByOrderId('buyer-1', 'order-1');

      expect(paymentRepository.findPaymentByOrderId).toHaveBeenCalledWith(
        'order-1',
      );
      expect(result).toBeDefined();
    });
  });

  describe('getPaymentById', () => {
    test('paymentId가 없으면 BadRequestError를 던진다', async () => {
      try {
        await service.getPaymentById('buyer-1', '');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('결제 정보가 없으면 NotFoundError를 던진다', async () => {
      (paymentRepository.findPaymentById as jest.Mock).mockResolvedValue(null);

      try {
        await service.getPaymentById('buyer-1', 'payment-1');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    test('다른 사용자의 결제 정보 조회는 BadRequestError를 던진다', async () => {
      const payment = createPayment({
        order: { ...createPayment().order, buyerId: 'other-buyer' },
      });
      (paymentRepository.findPaymentById as jest.Mock).mockResolvedValue(
        payment,
      );

      try {
        await service.getPaymentById('buyer-1', 'payment-1');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('본인 결제 정보를 조회하면 DTO로 반환한다', async () => {
      const payment = createPayment();
      (paymentRepository.findPaymentById as jest.Mock).mockResolvedValue(
        payment,
      );

      const result = await service.getPaymentById('buyer-1', 'payment-1');

      expect(paymentRepository.findPaymentById).toHaveBeenCalledWith(
        'payment-1',
      );
      expect(result).toBeDefined();
    });
  });

  describe('getPaymentsByUserId', () => {
    test('page가 1 미만이면 BadRequestError를 던진다', async () => {
      try {
        await service.getPaymentsByUserId('buyer-1', 10, 0);
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('limit이 1 미만이면 BadRequestError를 던진다', async () => {
      try {
        await service.getPaymentsByUserId('buyer-1', 0, 1);
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('결제 목록을 페이지네이션으로 반환한다', async () => {
      const payment1 = createPayment({ id: 'payment-1' });
      const payment2 = createPayment({ id: 'payment-2' });

      (paymentRepository.findPaymentsByUserId as jest.Mock).mockResolvedValue({
        payments: [payment1, payment2],
        total: 2,
      });

      const result = await service.getPaymentsByUserId('buyer-1', 10, 1);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
    });

    test('상태 필터를 적용해 결제 목록을 반환한다', async () => {
      const payment = createPayment({ status: 'CompletedPayment' });

      (paymentRepository.findPaymentsByUserId as jest.Mock).mockResolvedValue({
        payments: [payment],
        total: 1,
      });

      const result = await service.getPaymentsByUserId(
        'buyer-1',
        10,
        1,
        'CompletedPayment',
      );

      expect(result.data).toHaveLength(1);
    });

    test('페이지네이션 계산이 정확하다', async () => {
      (paymentRepository.findPaymentsByUserId as jest.Mock).mockResolvedValue({
        payments: Array(5).fill(createPayment()),
        total: 37,
      });

      const result = await service.getPaymentsByUserId('buyer-1', 10, 2);

      expect(result.meta.totalPages).toBe(4);
    });

    test('기본값으로 limit 10, page 1을 사용한다', async () => {
      (paymentRepository.findPaymentsByUserId as jest.Mock).mockResolvedValue({
        payments: [createPayment()],
        total: 1,
      });

      await service.getPaymentsByUserId('buyer-1');

      expect(paymentRepository.findPaymentsByUserId).toHaveBeenCalledWith(
        'buyer-1',
        10,
        1,
        undefined,
      );
    });

    test('빈 결제 목록을 반환할 수 있다', async () => {
      (paymentRepository.findPaymentsByUserId as jest.Mock).mockResolvedValue({
        payments: [],
        total: 0,
      });

      const result = await service.getPaymentsByUserId('buyer-1', 10, 1);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getPaymentsByStatus', () => {
    test('status가 없으면 BadRequestError를 던진다', async () => {
      try {
        await service.getPaymentsByStatus('');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('상태별 결제 목록을 반환한다', async () => {
      const payment1 = createPayment({ id: 'payment-1' });
      const payment2 = createPayment({ id: 'payment-2' });

      (paymentRepository.findPaymentsByStatus as jest.Mock).mockResolvedValue([
        payment1,
        payment2,
      ]);

      const result = await service.getPaymentsByStatus('CompletedPayment');

      expect(result).toHaveLength(2);
    });

    test('빈 결제 목록을 반환할 수 있다', async () => {
      (paymentRepository.findPaymentsByStatus as jest.Mock).mockResolvedValue(
        [],
      );

      const result = await service.getPaymentsByStatus('FailedPayment');

      expect(result).toHaveLength(0);
    });
  });

  describe('cancelPayment', () => {
    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      try {
        await service.cancelPayment('buyer-1', '');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('결제 정보가 없으면 NotFoundError를 던진다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        null,
      );

      try {
        await service.cancelPayment('buyer-1', 'order-1');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    test('다른 사용자의 결제를 취소하려 하면 BadRequestError를 던진다', async () => {
      const payment = createPayment({
        order: { ...createPayment().order, buyerId: 'other-buyer' },
      });
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        payment,
      );

      try {
        await service.cancelPayment('buyer-1', 'order-1');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('취소 불가능한 상태면 BadRequestError를 던진다', async () => {
      const payment = createPayment({ status: 'CompletedPayment' });
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        payment,
      );
      (paymentUtil.isPaymentCancellable as jest.Mock).mockReturnValue(false);

      try {
        await service.cancelPayment('buyer-1', 'order-1');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('결제를 성공적으로 취소한다', async () => {
      const payment = createPayment({ status: 'WaitingPayment' });
      const canceledPayment = createPayment({ status: 'CanceledPayment' });

      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        payment,
      );
      (paymentUtil.isPaymentCancellable as jest.Mock).mockReturnValue(true);
      (
        paymentRepository.cancelPaymentWithTransaction as jest.Mock
      ).mockResolvedValue(canceledPayment);

      const result = await service.cancelPayment('buyer-1', 'order-1');

      expect(result).toBeDefined();
    });

    test('트랜잭션 실패 시 BadRequestError를 던진다', async () => {
      const payment = createPayment({ status: 'WaitingPayment' });
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        payment,
      );
      (paymentUtil.isPaymentCancellable as jest.Mock).mockReturnValue(true);
      (
        paymentRepository.cancelPaymentWithTransaction as jest.Mock
      ).mockRejectedValue(new Error('이미 취소된 결제입니다'));

      try {
        await service.cancelPayment('buyer-1', 'order-1');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
      }
    });

    test('트랜잭션 일반 에러도 처리한다', async () => {
      const payment = createPayment({ status: 'WaitingPayment' });
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        payment,
      );
      (paymentUtil.isPaymentCancellable as jest.Mock).mockReturnValue(true);
      (
        paymentRepository.cancelPaymentWithTransaction as jest.Mock
      ).mockRejectedValue(new Error());

      try {
        await service.cancelPayment('buyer-1', 'order-1');
        fail('예외가 발생해야 합니다');
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toBe('결제 취소 실패');
      }
    });
  });
});
