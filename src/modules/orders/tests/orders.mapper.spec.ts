import {
  toOrderDto,
  toOrderItemDto,
  toPaymentDto,
  toShippingDto,
} from '../utils/orders.mapper';

describe('orders.mapper', () => {
  // ─── toOrderDto ───
  describe('toOrderDto', () => {
    const baseOrder = {
      id: 'order-1',
      buyerId: 'buyer-1',
      buyerName: '테스트',
      phoneNumber: '010-1111-2222',
      address: '서울시',
      usedPoints: 1000,
      earnedPoints: 200,
      status: 'WaitingPayment',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
      items: [{ id: 'item-1' }],
      payment: { id: 'pay-1' },
      shipping: { id: 'ship-1' },
    };

    test('주문 엔티티를 DTO로 정상 변환한다', () => {
      const dto = toOrderDto(baseOrder);

      expect(dto.id).toBe('order-1');
      expect(dto.buyerId).toBe('buyer-1');
      expect(dto.buyerName).toBe('테스트');
      expect(dto.usedPoints).toBe(1000);
      expect(dto.earnedPoints).toBe(200);
      expect(dto.items).toHaveLength(1);
      expect(dto.payment).toEqual({ id: 'pay-1' });
      expect(dto.shipping).toEqual({ id: 'ship-1' });
    });

    test('items가 없고 orderItems가 있으면 orderItems를 사용한다', () => {
      const order = {
        ...baseOrder,
        items: undefined,
        orderItems: [{ id: 'oi-1' }],
      };
      const dto = toOrderDto(order);

      expect(dto.items).toEqual([{ id: 'oi-1' }]);
    });

    test('items와 orderItems 모두 없으면 빈 배열을 반환한다', () => {
      const order = { ...baseOrder, items: undefined, orderItems: undefined };
      const dto = toOrderDto(order);

      expect(dto.items).toEqual([]);
    });

    test('payment가 null이면 null을 반환한다', () => {
      const order = { ...baseOrder, payment: null };
      const dto = toOrderDto(order);

      expect(dto.payment).toBeNull();
    });

    test('shipping이 null이면 null을 반환한다', () => {
      const order = { ...baseOrder, shipping: null };
      const dto = toOrderDto(order);

      expect(dto.shipping).toBeNull();
    });
  });

  // ─── toOrderItemDto ───
  describe('toOrderItemDto', () => {
    const baseOrderItem = {
      id: 'item-1',
      unitPrice: 10000,
      quantity: 2,
      productId: 'product-1',
      productName: '테스트상품',
      productImageUrl: 'https://example.com/image.jpg',
      product: {
        name: '테스트상품',
        reviews: [
          {
            id: 'review-1',
            rating: 5,
            content: '좋아요',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ],
      },
      size: {
        id: 1,
        nameEn: 'Medium',
        nameKo: '중간',
      },
      reviews: [{ id: 'review-1' }],
    } as any;

    test('주문 아이템을 DTO로 정상 변환한다', () => {
      const dto = toOrderItemDto(baseOrderItem);

      expect(dto.id).toBe('item-1');
      expect(dto.price).toBe(10000);
      expect(dto.quantity).toBe(2);
      expect(dto.productId).toBe('product-1');
      expect(dto.product.name).toBe('테스트상품');
      expect(dto.product.image).toBe('https://example.com/image.jpg');
      expect(dto.product.reviews).toHaveLength(1);
      expect(dto.product.reviews[0].id).toBe('review-1');
      expect(dto.product.reviews[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(dto.size.id).toBe(1);
      expect(dto.size.size.en).toBe('Medium');
      expect(dto.size.size.ko).toBe('중간');
      expect(dto.isReviewed).toBe(true);
    });

    test('productImageUrl이 null이면 빈 문자열을 반환한다', () => {
      const item = { ...baseOrderItem, productImageUrl: null };
      const dto = toOrderItemDto(item);

      expect(dto.product.image).toBe('');
    });

    test('product.reviews가 없으면 빈 배열을 반환한다', () => {
      const item = {
        ...baseOrderItem,
        product: { ...baseOrderItem.product, reviews: null },
      };
      const dto = toOrderItemDto(item);

      expect(dto.product.reviews).toEqual([]);
    });

    test('reviews가 비어있으면 isReviewed는 false를 반환한다', () => {
      const item = { ...baseOrderItem, reviews: [] };
      const dto = toOrderItemDto(item);

      expect(dto.isReviewed).toBe(false);
    });

    test('reviews가 null이면 isReviewed는 false를 반환한다', () => {
      const item = { ...baseOrderItem, reviews: null };
      const dto = toOrderItemDto(item);

      expect(dto.isReviewed).toBe(false);
    });
  });

  // ─── toPaymentDto ───
  describe('toPaymentDto', () => {
    test('payment가 null이면 null을 반환한다', () => {
      const dto = toPaymentDto(null);
      expect(dto).toBeNull();
    });

    test('payment를 DTO로 정상 변환한다', () => {
      const payment = {
        id: 'pay-1',
        price: 20000,
        status: 'WaitingPayment',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        orderId: 'order-1',
      } as any;

      const dto = toPaymentDto(payment);

      expect(dto).not.toBeNull();
      expect(dto!.id).toBe('pay-1');
      expect(dto!.price).toBe(20000);
      expect(dto!.status).toBe('WaitingPayment');
      expect(dto!.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(dto!.updatedAt).toBe('2026-01-02T00:00:00.000Z');
      expect(dto!.orderId).toBe('order-1');
    });
  });

  // ─── toShippingDto ───
  describe('toShippingDto', () => {
    test('shipping이 null이면 null을 반환한다', () => {
      const dto = toShippingDto(null);
      expect(dto).toBeNull();
    });

    test('shipping을 DTO로 정상 변환한다', () => {
      const shipping = {
        id: 'ship-1',
        status: 'ReadyToShip',
        trackingNumber: '1234567890',
        carrier: '로켓배송',
        readyToShipAt: new Date('2026-01-01T00:00:00.000Z'),
        inShippingAt: null,
        deliveredAt: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      } as any;

      const dto = toShippingDto(shipping);

      expect(dto).not.toBeNull();
      expect(dto!.id).toBe('ship-1');
      expect(dto!.status).toBe('ReadyToShip');
      expect(dto!.trackingNumber).toBe('1234567890');
      expect(dto!.carrier).toBe('로켓배송');
      expect(dto!.readyToShipAt).toBe('2026-01-01T00:00:00.000Z');
      expect(dto!.inShippingAt).toBeNull();
      expect(dto!.deliveredAt).toBeNull();
      expect(dto!.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(dto!.updatedAt).toBe('2026-01-02T00:00:00.000Z');
    });

    test('배송 시간이 모두 있으면 정상 변환한다', () => {
      const shipping = {
        id: 'ship-2',
        status: 'Delivered',
        trackingNumber: '9876543210',
        carrier: 'CJ대한통운',
        readyToShipAt: new Date('2026-01-01T00:00:00.000Z'),
        inShippingAt: new Date('2026-01-02T00:00:00.000Z'),
        deliveredAt: new Date('2026-01-03T00:00:00.000Z'),
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      } as any;

      const dto = toShippingDto(shipping);

      expect(dto!.readyToShipAt).toBe('2026-01-01T00:00:00.000Z');
      expect(dto!.inShippingAt).toBe('2026-01-02T00:00:00.000Z');
      expect(dto!.deliveredAt).toBe('2026-01-03T00:00:00.000Z');
    });
  });
});
