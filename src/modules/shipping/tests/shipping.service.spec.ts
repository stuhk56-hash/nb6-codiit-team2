import { ShippingService } from '../shipping.service';
import { shippingRepository } from '../shipping.repository';
import {
  NotFoundError,
  BadRequestError,
} from '../../../lib/errors/customErrors';

jest.mock('../shipping.repository');

const service = new ShippingService();
const mockRepo = shippingRepository as jest.Mocked<typeof shippingRepository>;

const mockShipping = {
  id: 'ship-1',
  orderId: 'order-1',
  status: 'ReadyToShip' as const,
  trackingNumber: '1234567890',
  carrier: '로켓배송',
  readyToShipAt: new Date(),
  inShippingAt: null,
  deliveredAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  shippingHistories: [],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ShippingService', () => {
  // ─── getShippingByOrderId ───
  describe('getShippingByOrderId', () => {
    test('배송 정보를 정상적으로 반환한다', async () => {
      mockRepo.findShippingByOrderId.mockResolvedValue(mockShipping as any);

      const result = await service.getShippingByOrderId('order-1');

      expect(mockRepo.findShippingByOrderId).toHaveBeenCalledWith('order-1');
      expect(result.orderId).toBe('order-1');
      expect(result.status).toBe('ReadyToShip');
    });

    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.getShippingByOrderId('')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('배송 정보가 없으면 NotFoundError를 던진다', async () => {
      mockRepo.findShippingByOrderId.mockResolvedValue(null);

      await expect(
        service.getShippingByOrderId('non-existent'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── autoProgressShippingStatus ───
  describe('autoProgressShippingStatus', () => {
    test('ReadyToShip → InShipping으로 진행한다', async () => {
      mockRepo.findShippingByOrderId.mockResolvedValue(mockShipping as any);
      mockRepo.updateShippingStatus.mockResolvedValue({
        ...mockShipping,
        status: 'InShipping',
        inShippingAt: new Date(),
      } as any);

      const result = await service.autoProgressShippingStatus('order-1');

      expect(mockRepo.updateShippingStatus).toHaveBeenCalledWith(
        'order-1',
        'InShipping',
      );
      expect(result.status).toBe('InShipping');
    });

    test('InShipping → Delivered로 진행한다', async () => {
      mockRepo.findShippingByOrderId.mockResolvedValue({
        ...mockShipping,
        status: 'InShipping',
      } as any);
      mockRepo.updateShippingStatus.mockResolvedValue({
        ...mockShipping,
        status: 'Delivered',
        deliveredAt: new Date(),
      } as any);

      const result = await service.autoProgressShippingStatus('order-1');

      expect(mockRepo.updateShippingStatus).toHaveBeenCalledWith(
        'order-1',
        'Delivered',
      );
      expect(result.status).toBe('Delivered');
    });

    test('Delivered 상태면 변경 없이 현재 상태를 반환한다', async () => {
      const deliveredShipping = {
        ...mockShipping,
        status: 'Delivered',
        deliveredAt: new Date(),
      };
      mockRepo.findShippingByOrderId.mockResolvedValue(
        deliveredShipping as any,
      );

      const result = await service.autoProgressShippingStatus('order-1');

      expect(mockRepo.updateShippingStatus).not.toHaveBeenCalled();
      expect(result.status).toBe('Delivered');
    });

    test('알 수 없는 상태면 ReadyToShip으로 설정한다', async () => {
      mockRepo.findShippingByOrderId.mockResolvedValue({
        ...mockShipping,
        status: 'UnknownStatus',
      } as any);
      mockRepo.updateShippingStatus.mockResolvedValue({
        ...mockShipping,
        status: 'ReadyToShip',
      } as any);

      const result = await service.autoProgressShippingStatus('order-1');

      expect(mockRepo.updateShippingStatus).toHaveBeenCalledWith(
        'order-1',
        'ReadyToShip',
      );
      expect(result.status).toBe('ReadyToShip');
    });

    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.autoProgressShippingStatus('')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('배송 정보가 없으면 NotFoundError를 던진다', async () => {
      mockRepo.findShippingByOrderId.mockResolvedValue(null);

      await expect(
        service.autoProgressShippingStatus('non-existent'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── updateShippingStatus ───
  describe('updateShippingStatus', () => {
    test('배송 상태를 정상적으로 업데이트한다', async () => {
      mockRepo.updateShippingStatus.mockResolvedValue({
        ...mockShipping,
        status: 'InShipping',
        inShippingAt: new Date(),
      } as any);

      const result = await service.updateShippingStatus(
        'order-1',
        'InShipping',
      );

      expect(mockRepo.updateShippingStatus).toHaveBeenCalledWith(
        'order-1',
        'InShipping',
      );
      expect(result.status).toBe('InShipping');
    });

    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      await expect(
        service.updateShippingStatus('', 'InShipping'),
      ).rejects.toThrow(BadRequestError);
    });

    test('status가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.updateShippingStatus('order-1', '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('배송 정보가 없으면 NotFoundError를 던진다', async () => {
      mockRepo.updateShippingStatus.mockResolvedValue(null as any);

      await expect(
        service.updateShippingStatus('order-1', 'InShipping'),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
