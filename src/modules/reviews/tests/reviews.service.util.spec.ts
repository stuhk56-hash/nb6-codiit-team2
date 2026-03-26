import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import {
  ensureCreateReviewInput,
  ensureOrderItemPurchasableByBuyer,
  ensurePaidOrderItem,
  ensureReviewOwner,
  ensureUpdateReviewInput,
  normalizeReviewsQuery,
  requireOrderItem,
  requireProduct,
  requireReview,
} from '../utils/reviews.service.util';

function createOrderItem(partial: Partial<any> = {}) {
  return {
    id: 'order-item-1',
    productId: 'product-1',
    order: {
      buyerId: 'buyer-1',
      status: 'CompletedPayment',
      payment: {
        status: 'Paid',
      },
    },
    ...partial,
  } as any;
}

function createReview(partial: Partial<any> = {}) {
  return {
    id: 'review-1',
    buyerId: 'buyer-1',
    productId: 'product-1',
    content: '리뷰 내용',
    rating: 5,
    ...partial,
  } as any;
}

describe('reviews.service.util', () => {
  test('normalizeReviewsQuery는 기본 page/limit을 채운다', () => {
    const normalized = normalizeReviewsQuery({});

    expect(normalized).toEqual({
      page: 1,
      limit: 5,
    });
  });

  test('requireProduct, requireOrderItem, requireReview는 null이면 NotFoundError를 던진다', () => {
    expect(() => requireProduct(null)).toThrow(NotFoundError);
    expect(() => requireOrderItem(null)).toThrow(NotFoundError);
    expect(() => requireReview(null)).toThrow(NotFoundError);
  });

  test('ensureOrderItemPurchasableByBuyer는 다른 구매자면 ForbiddenError를 던진다', () => {
    expect(() =>
      ensureOrderItemPurchasableByBuyer(
        createOrderItem(),
        'buyer-2',
        'product-1',
      ),
    ).toThrow(ForbiddenError);
  });

  test('ensureOrderItemPurchasableByBuyer는 상품 ID가 다르면 BadRequestError를 던진다', () => {
    expect(() =>
      ensureOrderItemPurchasableByBuyer(
        createOrderItem(),
        'buyer-1',
        'product-2',
      ),
    ).toThrow(BadRequestError);
  });

  test('ensurePaidOrderItem는 결제 완료가 아니면 BadRequestError를 던진다', () => {
    expect(() =>
      ensurePaidOrderItem(
        createOrderItem({
          order: {
            buyerId: 'buyer-1',
            status: 'WaitingPayment',
            payment: {
              status: 'Pending',
            },
          },
        }),
      ),
    ).toThrow(BadRequestError);
  });

  test('ensureReviewOwner는 작성자가 다르면 ForbiddenError를 던진다', () => {
    expect(() => ensureReviewOwner(createReview(), 'buyer-2')).toThrow(
      ForbiddenError,
    );
  });

  test('ensureCreateReviewInput은 필수값 누락이나 잘못된 rating이면 BadRequestError를 던진다', () => {
    expect(() =>
      ensureCreateReviewInput({
        orderItemId: '',
        content: '',
        rating: 5,
      }),
    ).toThrow(BadRequestError);

    expect(() =>
      ensureCreateReviewInput({
        orderItemId: 'order-item-1',
        content: '리뷰',
        rating: 6,
      }),
    ).toThrow(BadRequestError);
  });

  test('ensureUpdateReviewInput은 수정 필드가 없거나 잘못된 rating이면 BadRequestError를 던진다', () => {
    expect(() => ensureUpdateReviewInput({})).toThrow(BadRequestError);
    expect(() => ensureUpdateReviewInput({ rating: 0 })).toThrow(
      BadRequestError,
    );
  });
});
