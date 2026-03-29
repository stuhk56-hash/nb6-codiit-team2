import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../../lib/errors/customErrors';
import type { CreateReviewDto } from '../dto/create-review.dto';
import type { UpdateReviewDto } from '../dto/update-review.dto';
import type {
  NormalizedReviewsQuery,
  OrderItemForReview,
  ReviewWithRelations,
  ReviewsQuery,
} from '../types/reviews.type';
import { DEFAULT_REVIEWS_LIMIT, DEFAULT_REVIEWS_PAGE } from './reviews.util';

export function normalizeReviewsQuery(
  query: ReviewsQuery,
): NormalizedReviewsQuery {
  return {
    page: query.page && query.page > 0 ? query.page : DEFAULT_REVIEWS_PAGE,
    limit: query.limit && query.limit > 0 ? query.limit : DEFAULT_REVIEWS_LIMIT,
  };
}

export function requireProduct(
  product: { id: string } | null,
  message = '요청한 리소스를 찾을 수 없습니다.',
) {
  if (!product) {
    throw new NotFoundError(message);
  }

  return product;
}

export function requireOrderItem(
  orderItem: OrderItemForReview | null,
  message = '요청한 리소스를 찾을 수 없습니다.',
): OrderItemForReview {
  if (!orderItem) {
    throw new NotFoundError(message);
  }

  return orderItem;
}

export function requireReview(
  review: ReviewWithRelations | null,
  message = '요청한 리소스를 찾을 수 없습니다.',
): ReviewWithRelations {
  if (!review) {
    throw new NotFoundError(message);
  }

  return review;
}

export function ensureOrderItemPurchasableByBuyer(
  orderItem: OrderItemForReview,
  buyerId: string,
  productId: string,
) {
  if (orderItem.order.buyerId !== buyerId) {
    throw new ForbiddenError('접근 권한이 없습니다.');
  }

  if (orderItem.productId !== productId) {
    throw new BadRequestError('주문 상품 정보가 올바르지 않습니다.');
  }
}

export function ensurePaidOrderItem(orderItem: OrderItemForReview) {
  if (orderItem.order.status !== 'CompletedPayment') {
    throw new BadRequestError(
      '결제가 완료된 주문만 리뷰를 작성할 수 있습니다.',
    );
  }

  const paymentStatus = orderItem.order.payment?.status;
  if (paymentStatus !== 'CompletedPayment') {
    throw new BadRequestError(
      '결제가 완료된 주문만 리뷰를 작성할 수 있습니다.',
    );
  }
}

export function ensureReviewOwner(
  review: ReviewWithRelations,
  buyerId: string,
) {
  if (review.buyerId !== buyerId) {
    throw new ForbiddenError('접근 권한이 없습니다.');
  }
}

export function ensureCreateReviewInput(data: CreateReviewDto) {
  if (!data.orderItemId || !data.content) {
    throw new BadRequestError();
  }

  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
    throw new BadRequestError();
  }
}

export function ensureUpdateReviewInput(data: UpdateReviewDto) {
  if (data.rating === undefined && data.content === undefined) {
    throw new BadRequestError();
  }

  if (
    data.rating !== undefined &&
    (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5)
  ) {
    throw new BadRequestError();
  }
}
