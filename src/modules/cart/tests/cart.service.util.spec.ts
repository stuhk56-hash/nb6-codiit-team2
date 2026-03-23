import * as cartServiceUtil from '../utils/cart.service.util';

describe('Cart Service Util', () => {
  describe('calculateSubtotal', () => {
    test('가격과 수량을 곱한 소계를 반환한다', () => {
      const result = cartServiceUtil.calculateSubtotal(50000, 2);
      expect(result).toBe(100000);
    });

    test('가격이 0일 때', () => {
      const result = cartServiceUtil.calculateSubtotal(0, 5);
      expect(result).toBe(0);
    });

    test('수량이 0일 때', () => {
      const result = cartServiceUtil.calculateSubtotal(50000, 0);
      expect(result).toBe(0);
    });

    test('소수점 계산', () => {
      const result = cartServiceUtil.calculateSubtotal(10000.5, 3);
      expect(result).toBe(30001.5);
    });
  });

  describe('calculateTotal', () => {
    test('여러 상품의 총액을 계산한다', () => {
      const items = [
        { price: 50000, quantity: 2 },
        { price: 30000, quantity: 1 },
      ];
      const result = cartServiceUtil.calculateTotal(items);
      expect(result).toBe(130000);
    });

    test('빈 배열이면 0을 반환한다', () => {
      const result = cartServiceUtil.calculateTotal([]);
      expect(result).toBe(0);
    });

    test('단일 상품 계산', () => {
      const items = [{ price: 100000, quantity: 1 }];
      const result = cartServiceUtil.calculateTotal(items);
      expect(result).toBe(100000);
    });

    test('많은 상품 계산', () => {
      const items = [
        { price: 10000, quantity: 1 },
        { price: 20000, quantity: 2 },
        { price: 30000, quantity: 3 },
      ];
      const result = cartServiceUtil.calculateTotal(items);
      expect(result).toBe(140000);
    });
  });
});
