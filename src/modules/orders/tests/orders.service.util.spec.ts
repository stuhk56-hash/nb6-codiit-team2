import {
  validatePointUsage,
  validateShippingInfo,
  validateOrderOwnership,
  validateOrderCancellation,
  validateAndCalculateOrderItems,
  resolveOrderItemImages,
  resolveOrdersItemImages,
} from '../utils/orders.service.util';
import { orderRepository } from '../orders.repository';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../../../lib/errors/customErrors';

jest.mock('../orders.repository');
jest.mock('../../s3/utils/s3.service.util');

beforeEach(() => {
  jest.clearAllMocks();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('orders.service.util', () => {
  // ─── validatePointUsage ───
  describe('validatePointUsage', () => {
    test('유효한 포인트 사용은 에러를 던지지 않는다', () => {
      expect(() => validatePointUsage(5000, 10000)).not.toThrow();
    });

    test('포인트가 0이면 에러를 던지지 않는다', () => {
      expect(() => validatePointUsage(0, 10000)).not.toThrow();
    });

    test('포인트가 음수이면 BadRequestError를 던진다', () => {
      expect(() => validatePointUsage(-1, 10000)).toThrow(BadRequestError);
    });

    test('포인트가 주문 금액을 초과하면 BadRequestError를 던진다', () => {
      expect(() => validatePointUsage(10001, 10000)).toThrow(BadRequestError);
    });

    test('포인트가 주문 금액과 동일하면 에러를 던지지 않는다', () => {
      expect(() => validatePointUsage(10000, 10000)).not.toThrow();
    });
  });

  // ─── validateShippingInfo ───
  describe('validateShippingInfo', () => {
    test('유효한 배송 정보는 에러를 던지지 않는다', () => {
      expect(() =>
        validateShippingInfo('이름', '010-1234-5678', '서울시'),
      ).not.toThrow();
    });

    test('이름이 빈 문자열이면 BadRequestError를 던진다', () => {
      expect(() => validateShippingInfo('', '010-1234-5678', '서울시')).toThrow(
        BadRequestError,
      );
    });

    test('전화번호가 빈 문자열이면 BadRequestError를 던진다', () => {
      expect(() => validateShippingInfo('이름', '', '서울시')).toThrow(
        BadRequestError,
      );
    });

    test('주소가 빈 문자열이면 BadRequestError를 던진다', () => {
      expect(() => validateShippingInfo('이름', '010-1234-5678', '')).toThrow(
        BadRequestError,
      );
    });
  });

  // ─── validateOrderOwnership ───
  describe('validateOrderOwnership', () => {
    test('동일한 buyerId면 에러를 던지지 않는다', () => {
      expect(() => validateOrderOwnership('buyer-1', 'buyer-1')).not.toThrow();
    });

    test('다른 buyerId면 BadRequestError를 던진다', () => {
      expect(() => validateOrderOwnership('buyer-1', 'buyer-2')).toThrow(
        BadRequestError,
      );
    });
  });

  // ─── validateOrderCancellation ───
  describe('validateOrderCancellation', () => {
    test('WaitingPayment + ReadyToShip이면 에러를 던지지 않는다', () => {
      expect(() =>
        validateOrderCancellation('WaitingPayment', 'ReadyToShip'),
      ).not.toThrow();
    });

    test('CompletedPayment + ReadyToShip이면 에러를 던지지 않는다', () => {
      expect(() =>
        validateOrderCancellation('CompletedPayment', 'ReadyToShip'),
      ).not.toThrow();
    });

    test('배송 중이면 BadRequestError를 던진다', () => {
      expect(() =>
        validateOrderCancellation('CompletedPayment', 'InShipping'),
      ).toThrow(BadRequestError);
    });

    test('배송 완료이면 BadRequestError를 던진다', () => {
      expect(() =>
        validateOrderCancellation('CompletedPayment', 'Delivered'),
      ).toThrow(BadRequestError);
    });

    test('이미 처리된 결제 상태이면 BadRequestError를 던진다', () => {
      expect(() => validateOrderCancellation('CanceledPayment')).toThrow(
        BadRequestError,
      );
    });

    test('결제 실패 상태이면 BadRequestError를 던진다', () => {
      expect(() => validateOrderCancellation('FailedPayment')).toThrow(
        BadRequestError,
      );
    });
  });

  // ─── validateAndCalculateOrderItems ───
  describe('validateAndCalculateOrderItems', () => {
    test('정상적인 주문 아이템을 검증하고 가격을 계산한다', async () => {
      (orderRepository.checkProductStock as jest.Mock).mockResolvedValue({
        id: 'stock-1',
        quantity: 50,
        product: { id: 'p1', name: '상품A', imageUrl: null, price: 10000 },
      });

      const result = await validateAndCalculateOrderItems([
        { productId: 'p1', sizeId: 1, quantity: 3 },
      ]);

      expect(result.totalPrice).toBe(30000);
      expect(result.processedItems).toHaveLength(1);
      expect(result.processedItems[0]).toEqual({
        productId: 'p1',
        sizeId: 1,
        quantity: 3,
        unitPrice: 10000,
        productName: '상품A',
        productImageUrl: null,
      });
    });

    test('여러 상품의 총 가격을 합산한다', async () => {
      (orderRepository.checkProductStock as jest.Mock)
        .mockResolvedValueOnce({
          id: 'stock-1',
          quantity: 50,
          product: { id: 'p1', name: '상품A', imageUrl: null, price: 10000 },
        })
        .mockResolvedValueOnce({
          id: 'stock-2',
          quantity: 30,
          product: {
            id: 'p2',
            name: '상품B',
            imageUrl: 'img.jpg',
            price: 20000,
          },
        });

      const result = await validateAndCalculateOrderItems([
        { productId: 'p1', sizeId: 1, quantity: 2 },
        { productId: 'p2', sizeId: 1, quantity: 1 },
      ]);

      expect(result.totalPrice).toBe(40000);
      expect(result.processedItems).toHaveLength(2);
      expect(result.processedItems[1].productImageUrl).toBe('img.jpg');
    });

    test('존재하지 않는 상품이면 NotFoundError를 던진다', async () => {
      (orderRepository.checkProductStock as jest.Mock).mockResolvedValue(null);

      await expect(
        validateAndCalculateOrderItems([
          { productId: 'non-existent', sizeId: 1, quantity: 1 },
        ]),
      ).rejects.toThrow(NotFoundError);
    });

    test('재고가 부족하면 ConflictError를 던진다', async () => {
      (orderRepository.checkProductStock as jest.Mock).mockResolvedValue({
        id: 'stock-1',
        quantity: 1,
        product: { id: 'p1', name: '상품A', imageUrl: null, price: 10000 },
      });

      await expect(
        validateAndCalculateOrderItems([
          { productId: 'p1', sizeId: 1, quantity: 5 },
        ]),
      ).rejects.toThrow(ConflictError);
    });
  });

  // ─── resolveOrderItemImages ───
  describe('resolveOrderItemImages', () => {
    test('productImageUrl이 없고 product.imageUrl이 있으면 S3 URL로 해석한다', async () => {
      (resolveS3ImageUrl as jest.Mock).mockResolvedValue(
        'https://cdn.example.com/resolved.jpg',
      );

      const order = {
        id: 'order-1',
        items: [
          {
            id: 'item-1',
            productImageUrl: null,
            product: { imageUrl: 'original.jpg' },
          },
        ],
      } as any;

      const result = await resolveOrderItemImages(order);

      expect(resolveS3ImageUrl).toHaveBeenCalledWith(
        'original.jpg',
        null,
        '/images/Mask-group.svg',
      );
      expect(result.items[0].productImageUrl).toBe(
        'https://cdn.example.com/resolved.jpg',
      );
    });

    test('productImageUrl이 이미 있으면 S3 해석을 건너뛴다', async () => {
      const order = {
        id: 'order-1',
        items: [
          {
            id: 'item-1',
            productImageUrl: 'existing.jpg',
            product: { imageUrl: 'original.jpg' },
          },
        ],
      } as any;

      const result = await resolveOrderItemImages(order);

      expect(resolveS3ImageUrl).not.toHaveBeenCalled();
      expect(result.items[0].productImageUrl).toBe('existing.jpg');
    });

    test('product.imageUrl도 없으면 S3 해석을 건너뛴다', async () => {
      const order = {
        id: 'order-1',
        items: [
          {
            id: 'item-1',
            productImageUrl: null,
            product: { imageUrl: null },
          },
        ],
      } as any;

      const result = await resolveOrderItemImages(order);

      expect(resolveS3ImageUrl).not.toHaveBeenCalled();
      expect(result.items[0].productImageUrl).toBeNull();
    });

    test('items가 없는 주문도 에러 없이 처리한다', async () => {
      const order = { id: 'order-1' } as any;

      const result = await resolveOrderItemImages(order);

      expect(resolveS3ImageUrl).not.toHaveBeenCalled();
      expect(result.id).toBe('order-1');
    });

    test('items가 빈 배열이면 에러 없이 처리한다', async () => {
      const order = { id: 'order-1', items: [] } as any;

      const result = await resolveOrderItemImages(order);

      expect(resolveS3ImageUrl).not.toHaveBeenCalled();
      expect(result.items).toEqual([]);
    });
  });

  // ─── resolveOrdersItemImages ───
  describe('resolveOrdersItemImages', () => {
    test('여러 주문의 이미지를 일괄 해석한다', async () => {
      (resolveS3ImageUrl as jest.Mock).mockResolvedValue(
        'https://cdn.example.com/resolved.jpg',
      );

      const orders = [
        {
          id: 'order-1',
          items: [
            {
              id: 'item-1',
              productImageUrl: null,
              product: { imageUrl: 'img1.jpg' },
            },
          ],
        },
        {
          id: 'order-2',
          items: [
            {
              id: 'item-2',
              productImageUrl: 'existing.jpg',
              product: { imageUrl: 'img2.jpg' },
            },
          ],
        },
      ] as any[];

      const results = await resolveOrdersItemImages(orders);

      expect(results).toHaveLength(2);
      expect(resolveS3ImageUrl).toHaveBeenCalledTimes(1);
      expect(results[0].items[0].productImageUrl).toBe(
        'https://cdn.example.com/resolved.jpg',
      );
      expect(results[1].items[0].productImageUrl).toBe('existing.jpg');
    });

    test('빈 주문 배열도 에러 없이 처리한다', async () => {
      const results = await resolveOrdersItemImages([]);

      expect(results).toEqual([]);
      expect(resolveS3ImageUrl).not.toHaveBeenCalled();
    });
  });
});
