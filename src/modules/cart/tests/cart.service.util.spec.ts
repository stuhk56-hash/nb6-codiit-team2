import {
  calculateSubtotal,
  calculateTotal,
  resolveCartImages,
  resolveCartItemDetailImage,
} from '../utils/cart.service.util';
import { resolveS3ImageUrl } from '../../s3/utils/s3.service.util';

jest.mock('../../s3/utils/s3.service.util');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('cart.service.util', () => {
  // ─── calculateSubtotal ───
  describe('calculateSubtotal', () => {
    test('가격 * 수량으로 소계를 계산한다', () => {
      expect(calculateSubtotal(10000, 3)).toBe(30000);
    });

    test('수량이 0이면 0을 반환한다', () => {
      expect(calculateSubtotal(10000, 0)).toBe(0);
    });

    test('가격이 0이면 0을 반환한다', () => {
      expect(calculateSubtotal(0, 5)).toBe(0);
    });
  });

  // ─── calculateTotal ───
  describe('calculateTotal', () => {
    test('모든 아이템의 총합을 계산한다', () => {
      const items = [
        { price: 10000, quantity: 2 },
        { price: 5000, quantity: 3 },
      ];
      expect(calculateTotal(items)).toBe(35000);
    });

    test('아이템이 없으면 0을 반환한다', () => {
      expect(calculateTotal([])).toBe(0);
    });

    test('단일 아이템의 총합을 계산한다', () => {
      const items = [{ price: 15000, quantity: 1 }];
      expect(calculateTotal(items)).toBe(15000);
    });
  });

  // ─── resolveCartImages ───
  describe('resolveCartImages', () => {
    test('장바구니 아이템들의 상품/스토어 이미지를 해석한다', async () => {
      (resolveS3ImageUrl as jest.Mock)
        .mockResolvedValueOnce('https://cdn.example.com/product.jpg')
        .mockResolvedValueOnce('https://cdn.example.com/store.jpg');

      const cart = {
        id: 'cart-1',
        items: [
          {
            product: {
              imageUrl: null,
              imageKey: 'product.jpg',
              store: {
                imageUrl: null,
                imageKey: 'store.jpg',
              },
            },
          },
        ],
      } as any;

      const result = await resolveCartImages(cart);

      expect(resolveS3ImageUrl).toHaveBeenCalledTimes(2);
      expect(result.items[0].product.imageUrl).toBe(
        'https://cdn.example.com/product.jpg',
      );
      expect(result.items[0].product.store.imageUrl).toBe(
        'https://cdn.example.com/store.jpg',
      );
    });

    test('아이템이 없으면 에러 없이 처리한다', async () => {
      const cart = { id: 'cart-1', items: [] } as any;

      const result = await resolveCartImages(cart);

      expect(resolveS3ImageUrl).not.toHaveBeenCalled();
      expect(result.items).toEqual([]);
    });

    test('여러 아이템의 이미지를 일괄 해석한다', async () => {
      (resolveS3ImageUrl as jest.Mock).mockResolvedValue(
        'https://cdn.example.com/resolved.jpg',
      );

      const cart = {
        id: 'cart-1',
        items: [
          {
            product: {
              imageUrl: null,
              imageKey: 'p1.jpg',
              store: { imageUrl: null, imageKey: 's1.jpg' },
            },
          },
          {
            product: {
              imageUrl: null,
              imageKey: 'p2.jpg',
              store: { imageUrl: null, imageKey: 's2.jpg' },
            },
          },
        ],
      } as any;

      const result = await resolveCartImages(cart);

      expect(resolveS3ImageUrl).toHaveBeenCalledTimes(4);
      expect(result.items[0].product.imageUrl).toBe(
        'https://cdn.example.com/resolved.jpg',
      );
      expect(result.items[1].product.store.imageUrl).toBe(
        'https://cdn.example.com/resolved.jpg',
      );
    });
  });

  // ─── resolveCartItemDetailImage ───
  describe('resolveCartItemDetailImage', () => {
    test('장바구니 아이템 상세의 상품 이미지를 해석한다', async () => {
      (resolveS3ImageUrl as jest.Mock).mockResolvedValue(
        'https://cdn.example.com/product.jpg',
      );

      const cartItem = {
        id: 'item-1',
        product: {
          imageUrl: null,
          imageKey: 'product.jpg',
        },
      } as any;

      const result = await resolveCartItemDetailImage(cartItem);

      expect(resolveS3ImageUrl).toHaveBeenCalledWith(
        null,
        'product.jpg',
        '/images/Mask-group.svg',
      );
      expect(result.product.imageUrl).toBe(
        'https://cdn.example.com/product.jpg',
      );
    });

    test('이미지가 이미 있으면 그대로 해석한다', async () => {
      (resolveS3ImageUrl as jest.Mock).mockResolvedValue(
        'https://cdn.example.com/existing.jpg',
      );

      const cartItem = {
        id: 'item-1',
        product: {
          imageUrl: 'existing.jpg',
          imageKey: null,
        },
      } as any;

      const result = await resolveCartItemDetailImage(cartItem);

      expect(resolveS3ImageUrl).toHaveBeenCalledWith(
        'existing.jpg',
        null,
        '/images/Mask-group.svg',
      );
      expect(result.product.imageUrl).toBe(
        'https://cdn.example.com/existing.jpg',
      );
    });
  });
});
