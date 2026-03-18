import type { ReviewDetailResponseDto } from '../dto/review-detail-response.dto';
import type { ReviewListResponseDto } from '../dto/review-list-response.dto';
import type { ReviewResponseDto } from '../dto/review-response.dto';
import type { ReviewListItem, ReviewWithRelations } from '../types/reviews.type';

export function toReviewResponseDto(review: ReviewWithRelations | ReviewListItem): ReviewResponseDto {
  const hasBuyer = 'buyer' in review && review.buyer !== null;

  return {
    id: review.id,
    userId: review.buyerId,
    productId: review.productId,
    orderItemId: review.orderItemId,
    rating: review.rating,
    content: review.content,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    ...(hasBuyer
      ? {
          user: {
            name: review.buyer.name,
          },
        }
      : {}),
  };
}

export function toReviewDetailResponseDto(review: ReviewWithRelations): ReviewDetailResponseDto {
  return {
    reviewId: review.id,
    productName: review.product.name,
    size: review.orderItem?.size
      ? {
          en: review.orderItem.size.nameEn,
          ko: review.orderItem.size.nameKo,
        }
      : null,
    price: review.orderItem?.unitPrice ?? null,
    quantity: review.orderItem?.quantity ?? null,
    rating: review.rating,
    content: review.content,
    reviewer: review.buyer.name,
    reviewCreatedAt: review.createdAt.toISOString(),
    purchasedAt: review.orderItem?.order.createdAt.toISOString() ?? null,
  };
}

export function toReviewListResponseDto(
  reviews: ReviewListItem[],
  totalCount: number,
  page: number,
  limit: number,
): ReviewListResponseDto {
  return {
    items: reviews.map(toReviewResponseDto),
    meta: {
      total: totalCount,
      page,
      limit,
      hasNextPage: page * limit < totalCount,
    },
  };
}
