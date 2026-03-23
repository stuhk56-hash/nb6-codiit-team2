import { prisma } from '../../../lib/constants/prismaClient';
import * as ordersService from '../orders.service';
import * as ordersRepository from '../orders.repository';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '../../../lib/errors/customErrors';

jest.mock('../orders.repository');

describe('주문 서비스 유닛 테스트', () => {
  const mockedRepository = ordersRepository as jest.Mocked<
    typeof ordersRepository
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder - 주문 생성', () => {
    test('새로운 주문을 생성한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 2 }],
        usePoint: 1000,
      };

      const mockStock = {
        id: 'stock-123',
        quantity: 100,
        product: {
          id: 'prod-123',
          name: '테스트 상품',
          imageUrl: null,
          price: 50000,
        },
      };

      const now = new Date();
      const mockOrder = {
        id: 'order-123',
        buyerId,
        buyerName: '홍길동',
        phoneNumber: '010-1234-5678',
        address: '서울시 강남구',
        status: 'WaitingPayment' as const,
        usedPoints: 1000,
        earnedPoints: 4900,
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'item-123',
            orderId: 'order-123',
            productId: 'prod-123',
            sizeId: 1,
            quantity: 2,
            unitPrice: 50000,
            productName: '테스트 상품',
            productImageUrl: null,
            createdAt: now,
            updatedAt: now,
            product: {
              id: 'prod-123',
              storeId: 'store-123',
              name: '테스트 상품',
              content: null,
              price: 50000,
              isSoldOut: false,
              categoryId: 'cat-123',
              imageUrl: null,
              imageKey: null,
              discountRate: null,
              discountStartTime: null,
              discountEndTime: null,
              createdAt: now,
              updatedAt: now,
              store: {
                id: 'store-123',
                sellerId: 'seller-123',
                name: '테스트 스토어',
                address: '서울시',
                detailAddress: '101호',
                phoneNumber: '010-1234-5678',
                content: '스토어',
                imageUrl: null,
                imageKey: null,
                createdAt: now,
                updatedAt: now,
              },
              stocks: [
                {
                  id: 'stock-123',
                  productId: 'prod-123',
                  sizeId: 1,
                  quantity: 100,
                  size: {
                    id: 1,
                    name: 'M',
                    nameEn: 'M',
                    nameKo: '미디움',
                  },
                },
              ],
              reviews: [],
            },
            size: {
              id: 1,
              name: 'M',
              nameEn: 'M',
              nameKo: '미디움',
            },
            reviews: [],
          },
        ],
        payment: {
          id: 'payment-123',
          orderId: 'order-123',
          price: 99000,
          status: 'Paid' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      (mockedRepository.checkProductStock as jest.Mock).mockResolvedValue(
        mockStock,
      );
      (
        mockedRepository.createOrderWithTransaction as jest.Mock
      ).mockResolvedValue(mockOrder);

      const result = await ordersService.createOrder(buyerId, createOrderDto);

      expect(result).toHaveProperty('id', 'order-123');
      expect(result).toHaveProperty('buyerName', '홍길동');
      expect(result).toHaveProperty('orderItems');
      expect(result.orderItems).toHaveLength(1);
    });

    test('여러 상품 중 일부가 재고 부족이면 ConflictError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        orderItems: [
          { productId: 'prod-123', sizeId: 1, quantity: 50 },
          { productId: 'prod-456', sizeId: 2, quantity: 100 },
        ],
        usePoint: 1000,
      };

      const mockStock1 = {
        id: 'stock-123',
        quantity: 10, // 부족
        product: {
          id: 'prod-123',
          name: '테스트 상품 1',
          imageUrl: null,
          price: 50000,
        },
      };

      (mockedRepository.checkProductStock as jest.Mock)
        .mockResolvedValueOnce(mockStock1)
        .mockResolvedValueOnce(null);

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(ConflictError);
    });
    test('배송 정보(이름)가 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 2 }],
        usePoint: 1000,
      };

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(BadRequestError);
    });

    test('배송 정보(번호)가 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '',
        address: '서울시 강남구',
        orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 2 }],
        usePoint: 1000,
      };

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(BadRequestError);
    });

    test('배송 정보(주소)가 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '',
        orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 2 }],
        usePoint: 1000,
      };

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(BadRequestError);
    });

    test('주문 아이템이 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        orderItems: [],
        usePoint: 1000,
      };

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(BadRequestError);
    });

    test('주문 아이템이 배열이 아니면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        orderItems: null as any,
        usePoint: 1000,
      };

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(BadRequestError);
    });

    test('상품이 존재하지 않으면 NotFoundError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 2 }],
        usePoint: 1000,
      };

      (mockedRepository.checkProductStock as jest.Mock).mockResolvedValue(null);

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(NotFoundError);
    });

    test('재고가 부족하면 ConflictError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 100 }],
        usePoint: 1000,
      };

      const mockStock = {
        id: 'stock-123',
        quantity: 10,
        product: {
          id: 'prod-123',
          name: '테스트 상품',
          imageUrl: null,
          price: 50000,
        },
      };

      (mockedRepository.checkProductStock as jest.Mock).mockResolvedValue(
        mockStock,
      );

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(ConflictError);
    });

    test('포인트가 음수면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 2 }],
        usePoint: -1000,
      };

      const mockStock = {
        id: 'stock-123',
        quantity: 100,
        product: {
          id: 'prod-123',
          name: '테스트 상품',
          imageUrl: null,
          price: 50000,
        },
      };

      (mockedRepository.checkProductStock as jest.Mock).mockResolvedValue(
        mockStock,
      );

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(BadRequestError);
    });

    test('포인트를 초과하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const createOrderDto = {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        orderItems: [{ productId: 'prod-123', sizeId: 1, quantity: 2 }],
        usePoint: 200000,
      };

      const mockStock = {
        id: 'stock-123',
        quantity: 100,
        product: {
          id: 'prod-123',
          name: '테스트 상품',
          imageUrl: null,
          price: 50000,
        },
      };

      (mockedRepository.checkProductStock as jest.Mock).mockResolvedValue(
        mockStock,
      );

      await expect(
        ordersService.createOrder(buyerId, createOrderDto),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('getOrders - 주문 목록 조회', () => {
    test('페이지네이션과 함께 주문 목록을 반환한다', async () => {
      const buyerId = 'buyer-123';
      const now = new Date();

      const mockOrders = [
        {
          id: 'order-123',
          buyerId,
          buyerName: '홍길동',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
          status: 'WaitingPayment' as const,
          usedPoints: 1000,
          earnedPoints: 4900,
          createdAt: now,
          updatedAt: now,
          items: [],
          payment: {
            id: 'payment-123',
            orderId: 'order-123',
            price: 99000,
            status: 'Paid' as const,
            createdAt: now,
            updatedAt: now,
          },
        },
      ];

      (mockedRepository.findOrdersByUserId as jest.Mock).mockResolvedValue({
        orders: mockOrders,
        total: 1,
      });

      const result = await ordersService.getOrders(buyerId, 10, 1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('total', 1);
      expect(result.meta).toHaveProperty('page', 1);
      expect(result.meta).toHaveProperty('limit', 10);
      expect(result.meta).toHaveProperty('totalPages', 1);
    });

    test('limit이 0 이하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';

      await expect(ordersService.getOrders(buyerId, 0, 1)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('페이지 번호가 0 이하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';

      await expect(ordersService.getOrders(buyerId, 10, 0)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('상태 필터와 함께 주문 목록을 반환한다', async () => {
      const buyerId = 'buyer-123';
      const now = new Date();

      const mockOrders = [];

      (mockedRepository.findOrdersByUserId as jest.Mock).mockResolvedValue({
        orders: mockOrders,
        total: 0,
      });

      const result = await ordersService.getOrders(buyerId, 10, 1, 'Paid');

      expect(result.data).toHaveLength(0);
      expect(mockedRepository.findOrdersByUserId).toHaveBeenCalledWith(
        buyerId,
        10,
        1,
        'Paid',
      );
    });
  });

  describe('getOrdersById - 주문 상세 조회', () => {
    test('주문 상세 정보를 반환한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();

      const mockOrder = {
        id: orderId,
        buyerId,
        buyerName: '홍길동',
        phoneNumber: '010-1234-5678',
        address: '서울시 강남구',
        status: 'WaitingPayment' as const,
        usedPoints: 1000,
        earnedPoints: 4900,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 99000,
          status: 'Paid' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      const result = await ordersService.getOrdersById(buyerId, orderId);

      expect(result).toHaveProperty('id', orderId);
      expect(result).toHaveProperty('buyerName', '홍길동');
      expect(mockedRepository.findOrderById).toHaveBeenCalledWith(orderId);
    });

    test('주문이 없으면 NotFoundError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'invalid-order';

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(null);

      await expect(
        ordersService.getOrdersById(buyerId, orderId),
      ).rejects.toThrow(NotFoundError);
    });

    test('다른 구매자의 주문이면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();

      const mockOrder = {
        id: orderId,
        buyerId: 'other-buyer',
        buyerName: '김철수',
        phoneNumber: '010-8765-4321',
        address: '부산시 해운대구',
        status: 'WaitingPayment' as const,
        usedPoints: 0,
        earnedPoints: 5000,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 100000,
          status: 'Paid' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      await expect(
        ordersService.getOrdersById(buyerId, orderId),
      ).rejects.toThrow(BadRequestError);
    });

    test('orderId가 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';

      await expect(ordersService.getOrdersById(buyerId, '')).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe('updateOrder - 주문 정보 수정', () => {
    test('주문 정보를 수정한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();
      const updateOrderDto = {
        name: '신길동',
        phone: '010-9999-9999',
        address: '인천시 남동구',
      };

      const mockOrder = {
        id: orderId,
        buyerId,
        buyerName: '홍길동',
        phoneNumber: '010-1234-5678',
        address: '서울시 강남구',
        status: 'WaitingPayment' as const,
        usedPoints: 1000,
        earnedPoints: 4900,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 99000,
          status: 'Paid' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      const mockUpdatedOrder = {
        ...mockOrder,
        buyerName: '신길동',
        phoneNumber: '010-9999-9999',
        address: '인천시 남동구',
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValueOnce(
        mockOrder,
      );
      (mockedRepository.updateOrder as jest.Mock).mockResolvedValue(
        mockUpdatedOrder,
      );

      const result = await ordersService.updateOrder(
        buyerId,
        orderId,
        updateOrderDto,
      );

      expect(result).toHaveProperty('buyerName', '신길동');
      expect(mockedRepository.updateOrder).toHaveBeenCalled();
    });

    test('일부 필드만 수정한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();
      const updateOrderDto = {
        name: '신길동',
      };

      const mockOrder = {
        id: orderId,
        buyerId,
        buyerName: '홍길동',
        phoneNumber: '010-1234-5678',
        address: '서울시 강남구',
        status: 'WaitingPayment' as const,
        usedPoints: 1000,
        earnedPoints: 4900,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 99000,
          status: 'Paid' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      const mockUpdatedOrder = {
        ...mockOrder,
        buyerName: '신길동',
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValueOnce(
        mockOrder,
      );
      (mockedRepository.updateOrder as jest.Mock).mockResolvedValue(
        mockUpdatedOrder,
      );

      const result = await ordersService.updateOrder(
        buyerId,
        orderId,
        updateOrderDto,
      );

      expect(result).toHaveProperty('buyerName', '신길동');
    });

    test('orderId가 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const updateOrderDto = {
        name: '신길동',
      };

      await expect(
        ordersService.updateOrder(buyerId, '', updateOrderDto),
      ).rejects.toThrow(BadRequestError);
    });

    test('주문이 없으면 NotFoundError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const updateOrderDto = {
        name: '신길동',
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(null);

      await expect(
        ordersService.updateOrder(buyerId, orderId, updateOrderDto),
      ).rejects.toThrow(NotFoundError);
    });

    test('다른 구매자의 주문을 수정하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();
      const updateOrderDto = {
        name: '신길동',
        phone: '010-9999-9999',
        address: '인천시 남동구',
      };

      const mockOrder = {
        id: orderId,
        buyerId: 'other-buyer',
        buyerName: '김철수',
        phoneNumber: '010-8765-4321',
        address: '부산시 해운대구',
        status: 'WaitingPayment' as const,
        usedPoints: 0,
        earnedPoints: 5000,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 100000,
          status: 'Paid' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      await expect(
        ordersService.updateOrder(buyerId, orderId, updateOrderDto),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('cancelOrder - 주문 취소', () => {
    test('주문을 취소한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();

      const mockOrder = {
        id: orderId,
        buyerId,
        buyerName: '홍길동',
        phoneNumber: '010-1234-5678',
        address: '서울시 강남구',
        status: 'WaitingPayment' as const,
        usedPoints: 1000,
        earnedPoints: 4900,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 99000,
          status: 'Pending' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(
        mockOrder,
      );
      (
        mockedRepository.cancelOrderWithTransaction as jest.Mock
      ).mockResolvedValue(undefined);

      const result = await ordersService.cancelOrder(buyerId, orderId);

      expect(result).toHaveProperty('message');
      expect(mockedRepository.cancelOrderWithTransaction).toHaveBeenCalled();
    });

    test('orderId가 없으면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';

      await expect(ordersService.cancelOrder(buyerId, '')).rejects.toThrow(
        BadRequestError,
      );
    });

    test('주문이 없으면 NotFoundError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'invalid-order';

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(null);

      await expect(ordersService.cancelOrder(buyerId, orderId)).rejects.toThrow(
        NotFoundError,
      );
    });

    test('다른 구매자의 주문을 취소하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();

      const mockOrder = {
        id: orderId,
        buyerId: 'other-buyer',
        buyerName: '김철수',
        phoneNumber: '010-8765-4321',
        address: '부산시 해운대구',
        status: 'WaitingPayment' as const,
        usedPoints: 0,
        earnedPoints: 5000,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 100000,
          status: 'Pending' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      await expect(ordersService.cancelOrder(buyerId, orderId)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('Paid 상태 주문을 취소하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();

      const mockOrder = {
        id: orderId,
        buyerId,
        buyerName: '홍길동',
        phoneNumber: '010-1234-5678',
        address: '서울시 강남구',
        status: 'WaitingPayment' as const,
        usedPoints: 1000,
        earnedPoints: 4900,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 99000,
          status: 'Paid' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      await expect(ordersService.cancelOrder(buyerId, orderId)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('Failed 상태 주문을 취소하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();

      const mockOrder = {
        id: orderId,
        buyerId,
        buyerName: '홍길동',
        phoneNumber: '010-1234-5678',
        address: '서울시 강남구',
        status: 'WaitingPayment' as const,
        usedPoints: 1000,
        earnedPoints: 4900,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 99000,
          status: 'Failed' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      await expect(ordersService.cancelOrder(buyerId, orderId)).rejects.toThrow(
        BadRequestError,
      );
    });

    test('Canceled 상태 주문을 취소하면 BadRequestError를 throw한다', async () => {
      const buyerId = 'buyer-123';
      const orderId = 'order-123';
      const now = new Date();

      const mockOrder = {
        id: orderId,
        buyerId,
        buyerName: '홍길동',
        phoneNumber: '010-1234-5678',
        address: '서울시 강남구',
        status: 'WaitingPayment' as const,
        usedPoints: 1000,
        earnedPoints: 4900,
        createdAt: now,
        updatedAt: now,
        items: [],
        payment: {
          id: 'payment-123',
          orderId,
          price: 99000,
          status: 'Canceled' as const,
          createdAt: now,
          updatedAt: now,
        },
      };

      (mockedRepository.findOrderById as jest.Mock).mockResolvedValue(
        mockOrder,
      );

      await expect(ordersService.cancelOrder(buyerId, orderId)).rejects.toThrow(
        BadRequestError,
      );
    });
  });
});
