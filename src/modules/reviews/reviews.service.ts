import { Prisma } from '@prisma/client';
import type { AuthUser } from '../../types/auth-request.type';
import type { CreateReviewDto } from './dto/create-review.dto';
import type { ReviewDetailResponseDto } from './dto/review-detail-response.dto';
import type { ReviewListResponseDto } from './dto/review-list-response.dto';
import type { ReviewResponseDto } from './dto/review-response.dto';
import type { UpdateReviewDto } from './dto/update-review.dto';
import { reviewsRepository } from './reviews.repository';
import type { ReviewsQuery } from './types/reviews.type';
import {
  toReviewDetailResponseDto,
  toReviewListResponseDto,
  toReviewResponseDto,
} from './utils/reviews.mapper';
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
} from './utils/reviews.service.util';
import { BadRequestError } from '../../lib/errors/customErrors';

export class ReviewsService {
  async createReview(
    user: AuthUser,
    productId: string,
    data: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    ensureCreateReviewInput(data);
    requireProduct(await reviewsRepository.findProductById(productId), '상품을 찾지 못했습니다.');

    const orderItem = requireOrderItem(
      await reviewsRepository.findOrderItemById(data.orderItemId),
      '주문 아이템을 찾지 못했습니다.',
    );

    ensureOrderItemPurchasableByBuyer(orderItem, user.id, productId);
    ensurePaidOrderItem(orderItem);

    try {
      const created = await reviewsRepository.create({
        buyerId: user.id,
        productId,
        orderItemId: data.orderItemId,
        rating: data.rating,
        content: data.content,
      });

      return toReviewResponseDto(created);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestError('이미 리뷰를 작성한 주문입니다.');
      }
      throw error;
    }
  }

  async findProductReviews(
    productId: string,
    query: ReviewsQuery,
  ): Promise<ReviewListResponseDto> {
    requireProduct(await reviewsRepository.findProductById(productId), '상품을 찾지 못했습니다.');
    const normalized = normalizeReviewsQuery(query);
    const { reviews, totalCount } = await reviewsRepository.findPageByProductId(
      productId,
      normalized,
    );

    return toReviewListResponseDto(reviews, totalCount, normalized.page, normalized.limit);
  }

  async findReviewDetail(
    reviewId: string,
  ): Promise<ReviewDetailResponseDto> {
    const review = requireReview(
      await reviewsRepository.findById(reviewId),
      '리뷰를 찾을 수 없습니다.',
    );

    return toReviewDetailResponseDto(review);
  }

  async updateReview(
    user: AuthUser,
    reviewId: string,
    data: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    ensureUpdateReviewInput(data);

    const review = requireReview(
      await reviewsRepository.findById(reviewId),
      '리뷰를 찾을 수 없습니다.',
    );
    ensureReviewOwner(review, user.id);

    const updated = await reviewsRepository.updateById(reviewId, data);
    return toReviewResponseDto(updated);
  }

  async deleteReview(user: AuthUser, reviewId: string): Promise<void> {
    const review = requireReview(
      await reviewsRepository.findById(reviewId),
      '리뷰를 찾을 수 없습니다.',
    );
    ensureReviewOwner(review, user.id);

    await reviewsRepository.deleteById(reviewId);
  }
}

export const reviewsService = new ReviewsService();
