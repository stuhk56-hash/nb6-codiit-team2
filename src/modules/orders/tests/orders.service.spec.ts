import { OrderService } from '../orders.service';
import { orderRepository } from '../orders.repository';
import * as orderServiceUtil from '../utils/orders.service.util';
import * as ordersMapper from '../utils/orders.mapper';
import {
  BadRequestError,
  NotFoundError,
} from '../../../lib/errors/customErrors';

jest.mock('../orders.repository');
jest.mock('../utils/orders.service.util');
jest.mock('../utils/orders.mapper');

const service = new OrderService();

const mockOrder = {
  id: 'order-1',
  buyerId: 'buyer-1',
  buyerName: '테스트바이어',
  phoneNumber: '010-1111-2222',
  address: '서울시',
  usedPoints: 0,
  earnedPoints: 100,
  status: 'WaitingPayment',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
  payment: null,
  shipping: null,
};

const mockOrderDto = {
  id: 'order-1',
  buyerId: 'buyer-1',
  buyerName: '테스트바이어',
  phoneNumber: '010-1111-2222',
  address: '서울시',
  usedPoints: 0,
  earnedPoints: 100,
  status: 'WaitingPayment',
  createdAt: expect.any(Date),
  updatedAt: expect.any(Date),
  items: [],
  payment: null,
  shipping: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  (ordersMapper.toOrderDto as jest.Mock).mockReturnValue(mockOrderDto);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('OrderService', () => {
  // ─── getOrders ───
  describe('getOrders', () => {
    test('주문 목록을 정상적으로 반환한다', async () => {
      (orderRepository.findOrdersByUserId as jest.Mock).mockResolvedValue({
        orders: [mockOrder],
        total: 1,
      });
      (orderServiceUtil.resolveOrdersItemImages as jest.Mock).mockResolvedValue(
        [mockOrder],
      );

      const result = await service.getOrders('buyer-1', 10, 1);

      expect(orderRepository.findOrdersByUserId).toHaveBeenCalledWith(
        'buyer-1',
        10,
        1,
        undefined,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    test('status 필터를 전달할 수 있다', async () => {
      (orderRepository.findOrdersByUserId as jest.Mock).mockResolvedValue({
        orders: [],
        total: 0,
      });
      (orderServiceUtil.resolveOrdersItemImages as jest.Mock).mockResolvedValue(
        [],
      );

      await service.getOrders('buyer-1', 10, 1, 'WaitingPayment');

      expect(orderRepository.findOrdersByUserId).toHaveBeenCalledWith(
        'buyer-1',
        10,
        1,
        'WaitingPayment',
      );
    });

    test('page가 1 미만이면 BadRequestError를 던진다', async () => {
      await expect(service.getOrders('buyer-1', 10, 0)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('limit가 1 미만이면 BadRequestError를 던진다', async () => {
      await expect(service.getOrders('buyer-1', 0, 1)).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  // ─── getOrdersById ───
  describe('getOrdersById', () => {
    test('주문 상세를 정상적으로 반환한다', async () => {
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(mockOrder);
      (orderServiceUtil.validateOrderOwnership as jest.Mock).mockImplementation(
        () => {},
      );
      (orderServiceUtil.resolveOrderItemImages as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      const result = await service.getOrdersById('buyer-1', 'order-1');

      expect(orderRepository.findOrderById).toHaveBeenCalledWith('order-1');
      expect(orderServiceUtil.validateOrderOwnership).toHaveBeenCalledWith(
        'buyer-1',
        'buyer-1',
      );
      expect(result).toEqual(mockOrderDto);
    });

    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.getOrdersById('buyer-1', '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('주문이 존재하지 않으면 NotFoundError를 던진다', async () => {
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getOrdersById('buyer-1', 'non-existent'),
      ).rejects.toThrow(NotFoundError);
    });

    test('다른 바이어의 주문에 접근하면 에러를 던진다', async () => {
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(mockOrder);
      (orderServiceUtil.validateOrderOwnership as jest.Mock).mockImplementation(
        () => {
          throw new BadRequestError('접근 권한이 없습니다.');
        },
      );

      await expect(
        service.getOrdersById('other-buyer', 'order-1'),
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ─── createOrder ───
  describe('createOrder', () => {
    const createDto = {
      name: '테스트',
      phone: '010-1111-2222',
      address: '서울시',
      orderItems: [{ productId: 'p1', sizeId: 1, quantity: 2 }],
      usePoint: 0,
    };

    test('주문을 정상적으로 생성한다', async () => {
      (orderServiceUtil.validateShippingInfo as jest.Mock).mockImplementation(
        () => {},
      );
      (
        orderServiceUtil.validateAndCalculateOrderItems as jest.Mock
      ).mockResolvedValue({
        processedItems: [
          {
            productId: 'p1',
            sizeId: 1,
            quantity: 2,
            unitPrice: 10000,
            productName: '상품',
            productImageUrl: null,
          },
        ],
        totalPrice: 20000,
      });
      (orderServiceUtil.validatePointUsage as jest.Mock).mockImplementation(
        () => {},
      );
      (
        orderRepository.createOrderWithTransaction as jest.Mock
      ).mockResolvedValue(mockOrder);
      (orderServiceUtil.resolveOrderItemImages as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      const result = await service.createOrder('buyer-1', createDto);

      expect(orderServiceUtil.validateShippingInfo).toHaveBeenCalledWith(
        '테스트',
        '010-1111-2222',
        '서울시',
      );
      expect(
        orderServiceUtil.validateAndCalculateOrderItems,
      ).toHaveBeenCalledWith(createDto.orderItems);
      expect(orderServiceUtil.validatePointUsage).toHaveBeenCalledWith(
        0,
        20000,
      );
      expect(orderRepository.createOrderWithTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockOrderDto);
    });

    test('주문 상품이 없으면 BadRequestError를 던진다', async () => {
      await expect(
        service.createOrder('buyer-1', { ...createDto, orderItems: [] }),
      ).rejects.toThrow(BadRequestError);
    });

    test('수량이 0 이하이면 BadRequestError를 던진다', async () => {
      await expect(
        service.createOrder('buyer-1', {
          ...createDto,
          orderItems: [{ productId: 'p1', sizeId: 1, quantity: 0 }],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    test('수량이 999 초과이면 BadRequestError를 던진다', async () => {
      await expect(
        service.createOrder('buyer-1', {
          ...createDto,
          orderItems: [{ productId: 'p1', sizeId: 1, quantity: 1000 }],
        }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ─── updateOrder ───
  describe('updateOrder', () => {
    test('주문 정보를 정상적으로 수정한다', async () => {
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(mockOrder);
      (orderServiceUtil.validateOrderOwnership as jest.Mock).mockImplementation(
        () => {},
      );
      (orderRepository.updateOrder as jest.Mock).mockResolvedValue({
        ...mockOrder,
        buyerName: '수정됨',
      });
      (orderServiceUtil.resolveOrderItemImages as jest.Mock).mockResolvedValue({
        ...mockOrder,
        buyerName: '수정됨',
      });

      const result = await service.updateOrder('buyer-1', 'order-1', {
        name: '수정됨',
      });

      expect(orderRepository.updateOrder).toHaveBeenCalledWith('order-1', {
        buyerName: '수정됨',
      });
      expect(result).toEqual(mockOrderDto);
    });

    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      await expect(
        service.updateOrder('buyer-1', '', { name: '수정' }),
      ).rejects.toThrow(BadRequestError);
    });

    test('주문이 존재하지 않으면 NotFoundError를 던진다', async () => {
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateOrder('buyer-1', 'non-existent', { name: '수정' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── cancelOrder ───
  describe('cancelOrder', () => {
    test('주문을 정상적으로 취소한다', async () => {
      const cancelableOrder = {
        ...mockOrder,
        shipping: { status: 'ReadyToShip' },
      };
      (orderRepository.findOrderById as jest.Mock)
        .mockResolvedValueOnce(cancelableOrder)
        .mockResolvedValueOnce({ ...cancelableOrder, status: 'Canceled' });
      (
        orderRepository.cancelOrderWithTransaction as jest.Mock
      ).mockResolvedValue(undefined);

      const result = await service.cancelOrder('buyer-1', 'order-1');

      expect(orderRepository.cancelOrderWithTransaction).toHaveBeenCalledWith(
        'buyer-1',
        'order-1',
      );
      expect(result).toEqual(mockOrderDto);
    });

    test('orderId가 없으면 BadRequestError를 던진다', async () => {
      await expect(service.cancelOrder('buyer-1', '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('주문이 존재하지 않으면 NotFoundError를 던진다', async () => {
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.cancelOrder('buyer-1', 'non-existent'),
      ).rejects.toThrow(NotFoundError);
    });

    test('다른 바이어의 주문을 취소하면 BadRequestError를 던진다', async () => {
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        service.cancelOrder('other-buyer', 'order-1'),
      ).rejects.toThrow(BadRequestError);
    });

    test('배송 중인 주문을 취소하면 BadRequestError를 던진다', async () => {
      const shippingOrder = {
        ...mockOrder,
        shipping: { status: 'InShipping' },
      };
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(
        shippingOrder,
      );

      await expect(service.cancelOrder('buyer-1', 'order-1')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('이미 취소된 주문을 다시 취소하면 BadRequestError를 던진다', async () => {
      const canceledOrder = {
        ...mockOrder,
        status: 'Canceled',
        shipping: { status: 'ReadyToShip' },
      };
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(
        canceledOrder,
      );

      await expect(service.cancelOrder('buyer-1', 'order-1')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('cancelOrderWithTransaction에서 에러 발생 시 BadRequestError로 감싸서 던진다', async () => {
      const cancelableOrder = {
        ...mockOrder,
        shipping: { status: 'ReadyToShip' },
      };
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(
        cancelableOrder,
      );
      (
        orderRepository.cancelOrderWithTransaction as jest.Mock
      ).mockRejectedValue(new Error('트랜잭션 실패'));

      await expect(service.cancelOrder('buyer-1', 'order-1')).rejects.toThrow(
        BadRequestError,
      );
      await expect(service.cancelOrder('buyer-1', 'order-1')).rejects.toThrow(
        '트랜잭션 실패',
      );
    });

    test('cancelOrderWithTransaction에서 Error가 아닌 예외 발생 시 기본 메시지로 던진다', async () => {
      const cancelableOrder = {
        ...mockOrder,
        shipping: { status: 'ReadyToShip' },
      };
      (orderRepository.findOrderById as jest.Mock).mockResolvedValue(
        cancelableOrder,
      );
      (
        orderRepository.cancelOrderWithTransaction as jest.Mock
      ).mockRejectedValue('문자열 에러');

      await expect(service.cancelOrder('buyer-1', 'order-1')).rejects.toThrow(
        '주문 취소 실패',
      );
    });
  });
});
