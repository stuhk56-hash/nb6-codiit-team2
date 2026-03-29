import { isOrderEditable, isOrderCancellable } from '../utils/orders.util';

describe('orders.util', () => {
  // ─── isOrderEditable ───
  describe('isOrderEditable', () => {
    test('WaitingPayment 상태면 true를 반환한다', () => {
      expect(isOrderEditable('WaitingPayment')).toBe(true);
    });

    test('ReadyToShip 상태면 true를 반환한다', () => {
      expect(isOrderEditable('ReadyToShip')).toBe(true);
    });

    test('CompletedPayment 상태면 false를 반환한다', () => {
      expect(isOrderEditable('CompletedPayment')).toBe(false);
    });

    test('Canceled 상태면 false를 반환한다', () => {
      expect(isOrderEditable('Canceled')).toBe(false);
    });
  });

  // ─── isOrderCancellable ───
  describe('isOrderCancellable', () => {
    test('WaitingPayment 상태면 true를 반환한다', () => {
      expect(isOrderCancellable('WaitingPayment')).toBe(true);
    });

    test('CompletedPayment 상태면 true를 반환한다', () => {
      expect(isOrderCancellable('CompletedPayment')).toBe(true);
    });

    test('ReadyToShip 상태면 true를 반환한다', () => {
      expect(isOrderCancellable('ReadyToShip')).toBe(true);
    });

    test('Canceled 상태면 false를 반환한다', () => {
      expect(isOrderCancellable('Canceled')).toBe(false);
    });

    test('임의의 상태값이면 false를 반환한다', () => {
      expect(isOrderCancellable('SomeRandomStatus')).toBe(false);
    });
  });
});
