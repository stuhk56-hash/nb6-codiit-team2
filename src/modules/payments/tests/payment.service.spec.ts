import { PaymentService } from '../payment.service';
import { paymentRepository } from '../payment.repository';
import * as paymentServiceUtil from '../utils/payment.service.util';
import * as paymentUtil from '../utils/payment.util';
import * as paymentMapper from '../utils/payment.mapper';
import {
  BadRequestError,
  NotFoundError,
} from '../../../lib/errors/customErrors';

jest.mock('../payment.repository');
jest.mock('../utils/payment.service.util');
jest.mock('../utils/payment.util');
jest.mock('../utils/payment.mapper');

const service = new PaymentService();

const mockPayment = {
  id: 'pay-1',
  orderId: 'order-1',
  price: 20000,
  paymentMethod: 'CREDIT_CARD',
  status: 'WaitingPayment',
  cardNumber: '3456',
  bankName: null,
  phoneNumber: null,
  transactionId: 'TXN-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  order: {
    id: 'order-1',
    buyerId: 'buyer-1',
    buyerName: '테스트',
    phoneNumber: '010-1111-2222',
    address: '서울시',
    status: 'WaitingPayment',
    usedPoints: 0,
    earnedPoints: 0,
    createdAt: new Date(),
  },
};

const mockPaymentDto = {
  id: 'pay-1',
  orderId: 'order-1',
  price: 20000,
  paymentMethod: 'CREDIT_CARD',
  status: 'WaitingPayment',
};

beforeEach(() => {
  jest.clearAllMocks();
  (paymentMapper.toPaymentDto as jest.Mock).mockReturnValue(mockPaymentDto);
});

describe('PaymentService', () => {
  // ─── createPayment ───
  describe('createPayment', () => {
    test('결제를 정상적으로 생성한다', async () => {
      (
        paymentServiceUtil.validatePaymentMethod as jest.Mock
      ).mockImplementation(() => {});
      (
        paymentServiceUtil.validatePaymentAmount as jest.Mock
      ).mockImplementation(() => {});
      (paymentRepository.createPayment as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      const result = await service.createPayment(
        'order-1',
        20000,
        'CREDIT_CARD',
        '1234',
        undefined,
        undefined,
      );

      expect(paymentServiceUtil.validatePaymentMethod).toHaveBeenCalledWith(
        'CREDIT_CARD',
      );
      expect(paymentServiceUtil.validatePaymentAmount).toHaveBeenCalledWith(
        20000,
      );
      expect(paymentRepository.createPayment).toHaveBeenCalled();
      expect(result).toEqual(mockPaymentDto);
    });

    test('필수 정보가 누락되면 BadRequestError를 던진다', async () => {
      await expect(service.createPayment('', 0, '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      await expect(
        service.createPayment('', 20000, 'CREDIT_CARD'),
      ).rejects.toThrow(BadRequestError);
    });

    test('repository에서 에러 발생 시 BadRequestError로 감싸서 던진다', async () => {
      (
        paymentServiceUtil.validatePaymentMethod as jest.Mock
      ).mockImplementation(() => {});
      (
        paymentServiceUtil.validatePaymentAmount as jest.Mock
      ).mockImplementation(() => {});
      (paymentRepository.createPayment as jest.Mock).mockRejectedValue(
        new Error('DB 에러'),
      );

      await expect(
        service.createPayment('order-1', 20000, 'CREDIT_CARD'),
      ).rejects.toThrow('DB 에러');
    });

    test('Error가 아닌 예외 발생 시 기본 메시지로 던진다', async () => {
      (
        paymentServiceUtil.validatePaymentMethod as jest.Mock
      ).mockImplementation(() => {});
      (
        paymentServiceUtil.validatePaymentAmount as jest.Mock
      ).mockImplementation(() => {});
      (paymentRepository.createPayment as jest.Mock).mockRejectedValue(
        '문자열 에러',
      );

      await expect(
        service.createPayment('order-1', 20000, 'CREDIT_CARD'),
      ).rejects.toThrow('결제 생성 실패');
    });
  });

  // ─── getPaymentByOrderId ───
  describe('getPaymentByOrderId', () => {
    test('주문 ID로 결제를 정상 조회한다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      const result = await service.getPaymentByOrderId('buyer-1', 'order-1');

      expect(result).toEqual(mockPaymentDto);
    });

    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.getPaymentByOrderId('buyer-1', '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('결제가 없으면 NotFoundError를 던진다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.getPaymentByOrderId('buyer-1', 'order-1'),
      ).rejects.toThrow(NotFoundError);
    });

    test('다른 바이어의 결제에 접근하면 BadRequestError를 던진다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      await expect(
        service.getPaymentByOrderId('other-buyer', 'order-1'),
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ─── getPaymentById ───
  describe('getPaymentById', () => {
    test('결제 ID로 정상 조회한다', async () => {
      (paymentRepository.findPaymentById as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      const result = await service.getPaymentById('buyer-1', 'pay-1');

      expect(result).toEqual(mockPaymentDto);
    });

    test('paymentId가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.getPaymentById('buyer-1', '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('결제가 없으면 NotFoundError를 던진다', async () => {
      (paymentRepository.findPaymentById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getPaymentById('buyer-1', 'non-existent'),
      ).rejects.toThrow(NotFoundError);
    });

    test('다른 바이어의 결제에 접근하면 BadRequestError를 던진다', async () => {
      (paymentRepository.findPaymentById as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      await expect(
        service.getPaymentById('other-buyer', 'pay-1'),
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ─── getPaymentsByUserId ───
  describe('getPaymentsByUserId', () => {
    test('결제 내역을 정상적으로 반환한다', async () => {
      (paymentRepository.findPaymentsByUserId as jest.Mock).mockResolvedValue({
        payments: [mockPayment],
        total: 1,
      });

      const result = await service.getPaymentsByUserId('buyer-1', 10, 1);

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    test('status 필터를 전달할 수 있다', async () => {
      (paymentRepository.findPaymentsByUserId as jest.Mock).mockResolvedValue({
        payments: [],
        total: 0,
      });

      await service.getPaymentsByUserId('buyer-1', 10, 1, 'WaitingPayment');

      expect(paymentRepository.findPaymentsByUserId).toHaveBeenCalledWith(
        'buyer-1',
        10,
        1,
        'WaitingPayment',
      );
    });

    test('page가 1 미만이면 BadRequestError를 던진다', async () => {
      await expect(
        service.getPaymentsByUserId('buyer-1', 10, 0),
      ).rejects.toThrow(BadRequestError);
    });

    test('limit가 1 미만이면 BadRequestError를 던진다', async () => {
      await expect(
        service.getPaymentsByUserId('buyer-1', 0, 1),
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ─── getPaymentsByStatus ───
  describe('getPaymentsByStatus', () => {
    test('상태별로 결제를 조회한다', async () => {
      (paymentRepository.findPaymentsByStatus as jest.Mock).mockResolvedValue([
        mockPayment,
      ]);

      const result = await service.getPaymentsByStatus('WaitingPayment');

      expect(result).toHaveLength(1);
    });

    test('status가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.getPaymentsByStatus('')).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  // ─── cancelPayment ───
  describe('cancelPayment', () => {
    test('결제를 정상적으로 취소한다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        mockPayment,
      );
      (paymentUtil.isPaymentCancellable as jest.Mock).mockReturnValue(true);
      (
        paymentRepository.cancelPaymentWithTransaction as jest.Mock
      ).mockResolvedValue({
        ...mockPayment,
        status: 'CanceledPayment',
      });

      const result = await service.cancelPayment('buyer-1', 'order-1');

      expect(result).toEqual(mockPaymentDto);
    });

    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.cancelPayment('buyer-1', '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('결제가 없으면 NotFoundError를 던진다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.cancelPayment('buyer-1', 'order-1')).rejects.toThrow(
        NotFoundError,
      );
    });

    test('다른 바이어의 결제를 취소하면 BadRequestError를 던진다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      await expect(
        service.cancelPayment('other-buyer', 'order-1'),
      ).rejects.toThrow(BadRequestError);
    });

    test('취소 불가능한 상태면 BadRequestError를 던진다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        mockPayment,
      );
      (paymentUtil.isPaymentCancellable as jest.Mock).mockReturnValue(false);

      await expect(service.cancelPayment('buyer-1', 'order-1')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('트랜잭션에서 Error 발생 시 메시지를 그대로 던진다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        mockPayment,
      );
      (paymentUtil.isPaymentCancellable as jest.Mock).mockReturnValue(true);
      (
        paymentRepository.cancelPaymentWithTransaction as jest.Mock
      ).mockRejectedValue(new Error('트랜잭션 실패'));

      await expect(service.cancelPayment('buyer-1', 'order-1')).rejects.toThrow(
        '트랜잭션 실패',
      );
    });

    test('트랜잭션에서 Error가 아닌 예외 발생 시 기본 메시지로 던진다', async () => {
      (paymentRepository.findPaymentByOrderId as jest.Mock).mockResolvedValue(
        mockPayment,
      );
      (paymentUtil.isPaymentCancellable as jest.Mock).mockReturnValue(true);
      (
        paymentRepository.cancelPaymentWithTransaction as jest.Mock
      ).mockRejectedValue('문자열');

      await expect(service.cancelPayment('buyer-1', 'order-1')).rejects.toThrow(
        '결제 취소 실패',
      );
    });
  });
});
