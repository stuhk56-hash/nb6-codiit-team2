import { CartItem } from '@prisma/client';
import * as cartMapper from '../utils/cart.mapper';

describe('Cart Mapper', () => {
  describe('toCartItemDtos', () => {
    test('여러 CartItem을 DTO로 변환한다', () => {
      const now = new Date();
      const cartItems: CartItem[] = [
        {
          id: 'item-1',
          cartId: 'cart-123',
          productId: 'prod-1',
          sizeId: 1,
          quantity: 2,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'item-2',
          cartId: 'cart-123',
          productId: 'prod-2',
          sizeId: 2,
          quantity: 1,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const result = cartMapper.toCartItemDtos(cartItems);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'item-1');
      expect(result[0]).toHaveProperty('quantity', 2);
      expect(result[1]).toHaveProperty('id', 'item-2');
      expect(result[1]).toHaveProperty('quantity', 1);
    });

    test('빈 배열을 변환한다', () => {
      const result = cartMapper.toCartItemDtos([]);
      expect(result).toHaveLength(0);
    });

    test('단일 CartItem을 변환한다', () => {
      const now = new Date();
      const cartItems: CartItem[] = [
        {
          id: 'item-1',
          cartId: 'cart-123',
          productId: 'prod-1',
          sizeId: 1,
          quantity: 5,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const result = cartMapper.toCartItemDtos(cartItems);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'item-1');
      expect(result[0]).toHaveProperty('productId', 'prod-1');
    });
  });
});
